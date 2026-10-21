import json
import os
import tempfile
import sqlite3
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.main import create_app
from app.models import Team
from app.seed import SEED_PATH
from app import schemas
from app.media import present
from types import SimpleNamespace

PLAYER = {'nickname': 'NewTalent', 'firstName': 'Alex', 'lastName': 'Demo', 'nationality': 'Kazakhstan', 'age': 22, 'role': 'Rifler', 'rating': 1.15, 'status': 'free-agent', 'teamId': None}


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.url = 'sqlite:///' + (Path(self.temp.name) / 'test.db').as_posix()
        self.app = create_app(self.url)
        self.client = TestClient(self.app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.temp.cleanup()

    def test_seed_counts_shapes_and_relationships(self):
        seed = json.loads(SEED_PATH.read_text(encoding='utf-8'))
        records = {}
        for entity, count in [('players', 150), ('teams', 24), ('news', 30), ('matches', 40), ('tournaments', 12)]:
            response = self.client.get(f'/api/{entity}')
            self.assertEqual(response.status_code, 200)
            records[entity] = response.json()
            self.assertEqual(len(records[entity]), count)
            self.assertEqual(len({item['id'] for item in records[entity]}), count)
            schema = {'players': schemas.PlayerOut, 'teams': schemas.TeamOut, 'news': schemas.NewsOut, 'matches': schemas.MatchOut, 'tournaments': schemas.TournamentOut}[entity]
            expected = [present(SimpleNamespace(**item), schema).model_dump() for item in sorted(seed[entity], key=lambda item: item['id'])]
            self.assertEqual(records[entity], expected)
            for item in records[entity]:
                self.assertEqual(self.client.get(f"/api/{entity}/{item['id']}").json(), item)
        by_team = {item['id']: item for item in records['teams']}
        by_player = {item['id']: item for item in records['players']}
        for team in by_team.values():
            self.assertEqual(len(team['playerIds']), 5)
            for player_id in team['playerIds']:
                self.assertEqual(by_player[player_id]['teamId'], team['id'])
        free = [player for player in by_player.values() if player['status'] == 'free-agent']
        self.assertEqual(len(free), 30)
        for player in by_player.values():
            self.assertTrue(player['teamId'] in by_team if player['status'] == 'active' else player['teamId'] is None)
        tournament_ids = {item['id'] for item in records['tournaments']}
        for match in records['matches']:
            self.assertIn(match['team1Id'], by_team)
            self.assertIn(match['team2Id'], by_team)
            self.assertIn(match['tournamentId'], tournament_ids)
            self.assertEqual(match['score1'] is None, match['status'] == 'upcoming')
        for article in records['news']:
            self.assertTrue(article['relatedTeamId'] is None or article['relatedTeamId'] in by_team)

    def test_create_and_restart_does_not_overwrite(self):
        response = self.client.post('/api/players', json=PLAYER)
        self.assertEqual(response.status_code, 201)
        player = response.json()
        self.assertEqual(player['teamId'], None)
        self.assertEqual(player['status'], 'free-agent')
        with self.app.state.session_factory() as session:
            team = session.get(Team, 'team-01')
            team.description = 'An existing edited demo record.'
            session.commit()
        self.client.__exit__(None, None, None)
        self.app = create_app(self.url)
        self.client = TestClient(self.app)
        self.client.__enter__()
        self.assertEqual(self.client.get(f"/api/players/{player['id']}").json(), player)
        self.assertEqual(len(self.client.get('/api/players').json()), 151)
        self.assertEqual(self.client.get('/api/teams/team-01').json()['description'], 'An existing edited demo record.')
        self.assertEqual(len(self.client.get('/api/teams/team-01').json()['playerIds']), 5)

    def test_duplicate_case_insensitive_and_trimmed(self):
        self.assertEqual(self.client.post('/api/players', json=PLAYER).status_code, 201)
        response = self.client.post('/api/players', json={**PLAYER, 'nickname': ' NEWTALENT '})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['detail']['code'], 'DUPLICATE_PLAYER')
        self.assertEqual(len(self.client.get('/api/players').json()), 151)

    def test_validation_and_free_agent_only(self):
        invalid = [{key: value for key, value in PLAYER.items() if key != field} for field in ['nickname', 'firstName', 'lastName', 'nationality', 'age', 'role', 'rating']]
        invalid += [{**PLAYER, **change} for change in [{'nickname': ' '}, {'age': 15}, {'age': 46}, {'age': 22.5}, {'age': '22'}, {'rating': -1}, {'rating': 3.01}, {'role': 'Unknown'}, {'status': 'active'}, {'teamId': 'team-01'}, {'id': 'player-001'}]]
        for payload in invalid:
            with self.subTest(payload=payload):
                response = self.client.post('/api/players', json=payload)
                self.assertEqual(response.status_code, 422)
                self.assertEqual(response.json()['detail']['code'], 'VALIDATION_ERROR')
                self.assertTrue(response.json()['detail']['message'])
        for age, rating in [(16, 0), (45, 3)]:
            self.assertEqual(self.client.post('/api/players', json={**PLAYER, 'nickname': f'Boundary{age}', 'age': age, 'rating': rating}).status_code, 201)

    def test_patch_partial_update_persists_after_restart(self):
        original = self.client.get('/api/players/player-001').json()
        changes = {'nickname': ' UpdatedNickname ', 'age': 25, 'rating': 0}
        response = self.client.patch('/api/players/player-001', json=changes)
        self.assertEqual(response.status_code, 200)
        expected = {**original, **changes, 'nickname': 'UpdatedNickname'}
        self.assertEqual(response.json(), expected)
        team = self.client.get(f"/api/teams/{original['teamId']}").json()
        self.assertIn(original['id'], team['playerIds'])
        self.assertEqual(len(team['playerIds']), 5)
        self.client.__exit__(None, None, None)
        self.app = create_app(self.url)
        self.client = TestClient(self.app)
        self.client.__enter__()
        self.assertEqual(self.client.get('/api/players/player-001').json(), expected)
        self.assertEqual(self.client.post('/api/players', json={**PLAYER, 'nickname': 'updatednickname'}).status_code, 409)

    def test_patch_validation_conflicts_and_free_agent_relationships(self):
        created = self.client.post('/api/players', json=PLAYER).json()
        url = f"/api/players/{created['id']}"
        self.assertEqual(self.client.patch(url, json={'nickname': ' NEWTALENT '}).status_code, 200)
        before = self.client.get(url).json()
        other = self.client.get('/api/players/player-001').json()
        self.assertEqual(self.client.patch(url, json={'nickname': other['nickname'].upper(), 'age': 30}).status_code, 409)
        for changes in [{}, {'nickname': None}, {'nickname': ' '}, {'age': 15}, {'age': 46}, {'age': '22'}, {'rating': -1}, {'rating': 3.1}, {'role': 'Unknown'}, {'id': 'other'}, {'status': 'active'}, {'teamId': 'team-01'}, {'image': '/other.png'}]:
            with self.subTest(changes=changes):
                self.assertEqual(self.client.patch(url, json=changes).status_code, 422)
        self.assertEqual(self.client.get(url).json(), before)
        updated = self.client.patch(url, json={'nationality': 'Kazakhstan', 'role': 'AWPer'}).json()
        self.assertIsNone(updated['teamId'])
        self.assertEqual(updated['status'], 'free-agent')
        self.assertEqual(self.client.patch('/api/players/missing-id', json={'age': 22}).status_code, 404)
        cors = self.client.options(url, headers={'Origin': 'http://127.0.0.1:5173', 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'content-type'})
        self.assertEqual(cors.status_code, 200)
        self.assertIn('PATCH', cors.headers['access-control-allow-methods'])

    def test_not_found_and_cors(self):
        for entity in ['players', 'teams', 'news', 'matches', 'tournaments']:
            self.assertEqual(self.client.get(f'/api/{entity}/missing-id').status_code, 404)
        allowed = self.client.options('/api/players', headers={'Origin': 'http://127.0.0.1:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'})
        self.assertEqual(allowed.headers['access-control-allow-origin'], 'http://127.0.0.1:5173')
        blocked = self.client.get('/api/players', headers={'Origin': 'https://untrusted.example'})
        self.assertNotIn('access-control-allow-origin', blocked.headers)
        with patch.dict(os.environ, {'CORS_ORIGINS': '*'}):
            with self.assertRaises(ValueError):
                create_app(self.url)

    def test_patch_waits_for_short_database_lock(self):
        database_path = Path(self.temp.name) / 'test.db'
        lock = sqlite3.connect(database_path, check_same_thread=False)
        lock.execute('BEGIN IMMEDIATE')
        release = threading.Timer(0.2, lock.rollback)
        release.start()
        try:
            response = self.client.patch('/api/players/player-001', json={'rating': 1.23})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['rating'], 1.23)
        finally:
            release.join()
            lock.close()

    def test_patch_long_lock_returns_readable_error_without_changes(self):
        before = self.client.get('/api/players/player-001').json()
        # Keep this failure test fast; production connections wait 15 seconds.
        with self.app.state.engine.connect() as connection:
            connection.exec_driver_sql('PRAGMA busy_timeout=50')
        lock = sqlite3.connect(Path(self.temp.name) / 'test.db')
        lock.execute('BEGIN IMMEDIATE')
        try:
            response = self.client.patch('/api/players/player-001', json={'rating': 1.23})
            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()['detail']['code'], 'DATABASE_BUSY')
            self.assertEqual(response.headers['retry-after'], '2')
        finally:
            lock.rollback()
            lock.close()
        self.assertEqual(self.client.get('/api/players/player-001').json(), before)
        self.assertEqual(self.client.patch('/api/players/player-001', json={'rating': 1.23}).status_code, 200)


if __name__ == '__main__':
    unittest.main()
