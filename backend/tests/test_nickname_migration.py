import json
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest

from fastapi.testclient import TestClient
from app.main import create_app
from app.migrate_content import connect, rows, digest
from app.migrate_nicknames import run, MANIFEST


class NicknameMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.database = Path(self.temp.name) / 'test.db'
        with TestClient(create_app('sqlite:///' + self.database.as_posix())) as client:
            self.saved = client.post('/api/players', json={'nickname': 'PreserveUser', 'firstName': 'User', 'lastName': 'Created', 'nationality': 'Kazakhstan', 'age': 22, 'role': 'Rifler', 'rating': 1}).json()

    def tearDown(self):
        self.temp.cleanup()

    def state(self):
        with closing(connect(self.database)) as connection:
            return rows(connection)

    def test_backup_preservation_stable_ids_and_idempotency(self):
        before = self.state()
        raw = self.database.read_bytes()
        report = run(self.database)
        self.assertEqual(raw, self.database.read_bytes())
        self.assertEqual(report['conflicts'], [])
        self.assertEqual(len(report['assignments']), 114)
        self.assertEqual(len(report['retainedUnverifiedSlots']), 6)
        self.assertEqual(report['preservedFreeAgents'], 31)
        applied = run(self.database, True, report['planHash'])
        with closing(connect(Path(applied['backup']))) as connection:
            self.assertEqual(connection.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
            self.assertEqual(rows(connection), before)
        after = self.state()
        changes = {u['id'] for u in report['updates']}
        for table in before:
            self.assertEqual([p['id'] for p in before[table]], [p['id'] for p in after[table]])
            for old, new in zip(before[table], after[table]):
                allowed = {'nickname', 'nickname_key'} if table == 'players' and old['id'] in changes else set()
                self.assertEqual({k: v for k, v in old.items() if k not in allowed}, {k: v for k, v in new.items() if k not in allowed})
        repeated = run(self.database)
        self.assertEqual(repeated['updates'], [])
        self.assertFalse(run(self.database, True, repeated['planHash'])['applied'])
        with TestClient(create_app('sqlite:///' + self.database.as_posix())) as client:
            self.assertEqual(client.get('/api/players/' + self.saved['id']).json(), self.saved)
            for assignment in report['assignments']:
                player = client.get('/api/players/' + assignment['id']).json()
                self.assertEqual(player['nickname'], assignment['nickname'])
                self.assertEqual(player['teamId'], assignment['teamId'])

    def test_changed_plan_and_free_agent_nickname_conflict_block_apply(self):
        report = run(self.database)
        with closing(sqlite3.connect(self.database)) as connection, connection:
            connection.execute('UPDATE players SET nickname=?, nickname_key=? WHERE id=?', ('donk', 'donk', self.saved['id']))
        before = digest(self.state())
        self.assertTrue(run(self.database)['conflicts'])
        with self.assertRaises(ValueError):
            run(self.database, True, report['planHash'])
        self.assertEqual(before, digest(self.state()))
        self.assertFalse((self.database.parent / 'backups').exists())

    def test_existing_real_nickname_keeps_its_player_id(self):
        with closing(sqlite3.connect(self.database)) as connection, connection:
            connection.execute("UPDATE players SET nickname='donk', nickname_key='donk' WHERE id='player-125'")
        report = run(self.database)
        assignment = next(a for a in report['assignments'] if a['nickname'] == 'donk')
        self.assertEqual(assignment['id'], 'player-125')
        manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
        self.assertEqual(len(manifest['teams']), 24)
        self.assertTrue(all(t['source'].startswith('https://www.hltv.org/') for t in manifest['teams']))
