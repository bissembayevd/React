import json
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest

from fastapi.testclient import TestClient
from app.main import create_app
from app.migrate_content import run, connect, rows, digest


class ContentMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.database = Path(self.temp.name) / 'copy.db'
        self.url = 'sqlite:///' + self.database.as_posix()
        with TestClient(create_app(self.url)) as client:
            response = client.post('/api/players', json={'nickname': 'PreserveMe', 'firstName': 'User', 'lastName': 'Created', 'nationality': 'Kazakhstan', 'age': 20, 'role': 'Rifler', 'rating': 1.1})
            self.saved = response.json()

    def tearDown(self):
        self.temp.cleanup()

    def state(self):
        connection = connect(self.database)
        try:
            return rows(connection)
        finally:
            connection.close()

    def test_dry_run_is_read_only_then_backup_apply_and_repeat(self):
        before = self.state()
        raw_before = self.database.read_bytes()
        report = run(self.database)
        self.assertEqual(self.database.read_bytes(), raw_before)
        self.assertEqual(report['conflicts'], [])
        self.assertEqual(report['preservedFreeAgents'], 31)
        self.assertEqual(report['counts']['players'], 151)
        self.assertEqual(len(report['updates']), 60)
        self.assertFalse((self.database.parent / 'backups').exists())
        applied = run(self.database, apply=True, approved_hash=report['planHash'])
        self.assertTrue(applied['applied'])
        backup = Path(applied['backup'])
        connection = connect(backup)
        try:
            self.assertEqual(rows(connection), before)
        finally:
            connection.close()
        after = self.state()
        self.assertEqual([r['id'] for r in before['players']], [r['id'] for r in after['players']])
        self.assertEqual([r for r in before['players'] if r['status'] == 'free-agent'], [r for r in after['players'] if r['status'] == 'free-agent'])
        self.assertEqual(before['matches'], after['matches'])
        again = run(self.database)
        self.assertEqual(again['updates'], [])
        self.assertFalse(run(self.database, True, again['planHash'])['applied'])
        self.assertEqual(len(list(backup.parent.glob('*.db'))), 1)
        log = self.database.with_name('copy.db.migrations.jsonl')
        self.assertEqual(len(log.read_text(encoding='utf-8').splitlines()), 1)
        with TestClient(create_app(self.url)) as client:
            self.assertEqual(client.get('/api/players/' + self.saved['id']).json(), self.saved)
            player = client.get('/api/players/player-006').json()
            self.assertEqual(player['nickname'], 'ZywOo')
            self.assertEqual(player['provenance']['snapshotDate'], '2026-10-19')
            self.assertEqual(player['image'], '/images/photos/zywoo-2019.jpg')
            self.assertEqual(len(client.get('/api/teams/team-01').json()['playerIds']), 5)

    def test_apply_requires_current_approved_plan(self):
        report = run(self.database)
        with self.assertRaises(ValueError):
            run(self.database, True)
        with closing(sqlite3.connect(self.database)) as connection, connection:
            connection.execute("UPDATE teams SET ranking=99 WHERE id='team-24'")
        with self.assertRaises(ValueError):
            run(self.database, True, report['planHash'])
        self.assertFalse((self.database.parent / 'backups').exists())

    def test_edited_active_record_or_duplicate_nickname_blocks_entire_apply(self):
        with closing(sqlite3.connect(self.database)) as connection, connection:
            connection.execute("UPDATE players SET firstName='Edited' WHERE id='player-001'")
            connection.execute("UPDATE players SET nickname='ZywOo', nickname_key='zywoo' WHERE id=?", (self.saved['id'],))
        before = digest(self.state())
        report = run(self.database)
        self.assertEqual(len(report['conflicts']), 2)
        with self.assertRaises(ValueError):
            run(self.database, True, report['planHash'])
        self.assertEqual(digest(self.state()), before)

    def test_unrelated_fields_and_custom_images_are_preserved(self):
        with closing(sqlite3.connect(self.database)) as connection, connection:
            connection.execute("UPDATE news SET title='Custom title' WHERE id='news-001'")
            connection.execute("UPDATE tournaments SET prizePool=123 WHERE id='tournament-01'")
            connection.execute("UPDATE players SET image='/my-avatar.jpg' WHERE id=?", (self.saved['id'],))
        report = run(self.database)
        run(self.database, True, report['planHash'])
        after = self.state()
        self.assertEqual(after['news'][0]['title'], 'Custom title')
        self.assertEqual(after['tournaments'][0]['prizePool'], 123)
        self.assertEqual(next(p for p in after['players'] if p['id'] == self.saved['id'])['image'], '/my-avatar.jpg')


if __name__ == '__main__':
    unittest.main()
