import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import create_app
from app.seed import RESTORED_SEED_PATH, validate_seed


class RestoredSeedTests(unittest.TestCase):
    def test_render_snapshot_survives_fresh_database_and_preserves_existing_edits(self):
        snapshot = json.loads(RESTORED_SEED_PATH.read_text(encoding='utf-8'))
        validate_seed(snapshot, restored=True)
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {'CS2_RESTORED_SEED': '1'}):
            url = 'sqlite:///' + (Path(folder) / 'test.db').as_posix()
            with TestClient(create_app(url)) as client:
                self.assertEqual(len(client.get('/api/players').json()), len(snapshot['players']))
                self.assertEqual(client.get('/api/players/player-001').json()['nickname'], 'Aleksib')
                for entity in ['players', 'teams', 'news', 'matches', 'tournaments']:
                    actual = client.get('/api/' + entity).json()
                    self.assertEqual({r['id'] for r in actual}, {r['id'] for r in snapshot[entity]})
                    original = {r['id']: r for r in snapshot[entity]}
                    for row in actual:
                        for key, value in original[row['id']].items():
                            if key not in ('image', 'logo'):
                                self.assertEqual(row[key], value)
                self.assertEqual(client.get('/api/tournaments/tournament-01').json()['image'], '/images/photos/cologne.jpg')
                self.assertEqual(client.patch('/api/players/player-001', json={'nickname': 'KeepManualChange'}).status_code, 200)
                created = client.post('/api/players', json={'nickname': 'PreserveOnRestart', 'firstName': 'Test', 'lastName': 'User', 'nationality': 'Kazakhstan', 'age': 22, 'role': 'Rifler', 'rating': 1}).json()
            with TestClient(create_app(url)) as client:
                self.assertEqual(client.get('/api/players/player-001').json()['nickname'], 'KeepManualChange')
                self.assertEqual(client.get('/api/players/' + created['id']).json(), created)
                self.assertEqual(len(client.get('/api/players').json()), len(snapshot['players']) + 1)
