"""Explicit, guarded data migration. Never imported by application startup.

Dry runs open SQLite read-only. Applying requires the hash of a reviewed dry run.
Only seed rows and listed columns may change. No records are inserted or deleted.
"""
import argparse
from collections import Counter
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[2]
SEED = Path(__file__).with_name('seed_data.json')
SNAPSHOT = Path(__file__).with_name('roster_snapshot.json')
VERSION = 'phase6b-content-v1'
TABLES = ('players', 'teams', 'news', 'matches', 'tournaments')
CITIES = ['cologne', 'katowice', 'paris', 'copenhagen', 'dallas', 'rio', 'astana', 'stockholm', 'sydney', 'shanghai', 'ulaanbaatar', 'lisbon']

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def connect(path, readonly=True):
    connection = sqlite3.connect(path.resolve().as_uri() + ('?mode=ro' if readonly else '?mode=rw'), uri=True)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys=ON')
    return connection

def rows(connection):
    return {table: [dict(row) for row in connection.execute(f'SELECT * FROM {table} ORDER BY id')] for table in TABLES}

def assert_integrity(connection):
    if connection.execute('PRAGMA foreign_key_check').fetchall():
        raise ValueError('Foreign-key violations found')
    records = rows(connection)
    teams = {team['id'] for team in records['teams']}
    counts = Counter(player['teamId'] for player in records['players'] if player['status'] == 'active')
    if any(counts[team] != 5 for team in teams):
        raise ValueError('Each team must retain exactly five active players')
    for player in records['players']:
        if not (player['teamId'] in teams if player['status'] == 'active' else player['teamId'] is None):
            raise ValueError('Invalid player affiliation')
    if len({p['nickname'].casefold() for p in records['players']}) != len(records['players']):
        raise ValueError('Duplicate case-insensitive nicknames found')
    return records

def targets():
    seed = json.loads(SEED.read_text(encoding='utf-8'))
    original = {table: {row['id']: row for row in seed[table]} for table in TABLES}
    snapshot = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    changes = []
    identities = [player for team in snapshot['teams'] for player in team['players']]
    if any(len(team['players']) != 5 for team in snapshot['teams']) or len({p['id'] for p in identities}) != len(identities) or len({p['nickname'].casefold() for p in identities}) != len(identities):
        raise ValueError('Snapshot must contain complete, nonduplicated five-player rosters')
    for roster in snapshot['teams']:
        for player in roster['players']:
            before = original['players'][player['id']]
            if before['status'] != 'active' or before['teamId'] != roster['teamId']:
                raise ValueError('Only initial active player slots may receive verified identities')
            after = {key: value for key, value in player.items() if key != 'id'}
            after['nickname_key'] = player['nickname'].casefold()
            before = {**before, 'nickname_key': before['nickname'].casefold()}
            changes.append(('players', before, after))
        before = original['teams'][roster['teamId']]
        description = f"Verified roster snapshot: {snapshot['snapshotDate']}. Source: {roster['source']}. Rankings, ages, ratings and competition data remain fictional demo values. This is a dated snapshot, not a live roster feed."
        changes.append(('teams', before, {'description': description}))
    for index, city in enumerate(CITIES, 1):
        before = original['tournaments'][f'tournament-{index:02}']
        changes.append(('tournaments', before, {'image': f'/images/photos/{city}.jpg'}))
    for before in seed['news']:
        category = before['category']
        # Real stage archive for stage/competition articles; workstation for analysis.
        # Transfer stories cannot imply that an archive photo depicts a fictional transfer.
        image = '/images/news-dark.svg'
        if category in ['Match Preview', 'Tournament']:
            image = '/images/photos/cs-stage-' + ('01' if category == 'Match Preview' else '03') + '.jpg'
        elif category == 'Analysis':
            image = '/images/photos/gaming-setup.jpg'
        changes.append(('news', before, {'image': image}))
    for _, _, values in changes:
        if 'image' in values and not (ROOT / 'public' / values['image'].lstrip('/')).is_file():
            raise ValueError(f"Missing local asset: {values['image']}")
    return changes

def plan(connection):
    records = assert_integrity(connection)
    current = {table: {row['id']: row for row in records[table]} for table in TABLES}
    updates, conflicts, unchanged = [], [], []
    for table, seed, desired in targets():
        row = current[table].get(seed['id'])
        if row is None:
            conflicts.append(f'{table}/{seed["id"]}: initial record missing; no recreation permitted')
            continue
        diff = {key: {'before': row[key], 'after': value} for key, value in desired.items() if row[key] != value}
        if not diff:
            unchanged.append(f'{table}/{seed["id"]}')
            continue
        # Guard the complete original player identity, including affiliation and custom image.
        # Other entity updates guard only their requested fields, preserving unrelated edits.
        guarded = {key: value for key, value in seed.items() if key != 'playerIds'} if table == 'players' else {key: seed[key] for key in desired}
        if table == 'tournaments':
            guarded['location'] = seed['location']
        if table == 'news':
            guarded['category'] = seed['category']
        if any(row[key] not in (value, desired.get(key, value)) for key, value in guarded.items()):
            conflicts.append(f'{table}/{seed["id"]}: edited record; will not overwrite')
            continue
        if table == 'players':
            nickname = desired['nickname_key']
            if any(other['id'] != row['id'] and other['nickname'].casefold() == nickname for other in records['players']):
                conflicts.append(f'players/{row["id"]}: nickname already used; no player merge permitted')
                continue
        updates.append({'table': table, 'id': row['id'], 'fields': diff})
    report = {'version': VERSION, 'snapshotDate': '2026-10-19', 'counts': {table: len(value) for table, value in records.items()},
        'databaseFingerprint': digest(records), 'updates': updates, 'alreadyApplied': unchanged, 'conflicts': conflicts,
        'preservedFreeAgents': sum(p['status'] == 'free-agent' for p in records['players']),
        'manifestHash': digest({'seed': json.loads(SEED.read_text(encoding='utf-8')), 'snapshot': json.loads(SNAPSHOT.read_text(encoding='utf-8')), 'targets': targets()})}
    report['planHash'] = digest(report)
    return report

def run(database, apply=False, approved_hash=None):
    database = Path(database).resolve(strict=True)
    with closing(connect(database)) as source:
        report = plan(source)
    if not apply:
        return report
    if not approved_hash or approved_hash != report['planHash']:
        raise ValueError('Apply requires --approve-plan with the current reviewed dry-run planHash; regenerate the report if records changed')
    if report['conflicts']:
        raise ValueError('Conflicts must be reviewed before applying; no changes made')
    if not report['updates']:
        return {**report, 'applied': False, 'message': 'Already applied; no database writes or backup needed'}
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup = database.parent / 'backups' / f'{database.stem}-{VERSION}-{stamp}.db'
    backup.parent.mkdir(exist_ok=True)
    with closing(connect(database, readonly=False)) as connection:
        # Hold the write reservation while validating the approved snapshot and making a
        # consistent SQLite backup through a separate read connection (WAL-safe).
        connection.execute('BEGIN IMMEDIATE')
        try:
            if plan(connection)['planHash'] != approved_hash:
                raise ValueError('Database changed since dry run; no changes made')
            with closing(connect(database)) as source, closing(sqlite3.connect(backup)) as destination:
                source.backup(destination)
                if destination.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                    raise ValueError('Backup integrity check failed')
            before = rows(connection)
            for update in report['updates']:
                fields = update['fields']
                assignments = ', '.join(f'"{key}"=?' for key in fields)
                connection.execute(f'UPDATE {update["table"]} SET {assignments} WHERE id=?', [field['after'] for field in fields.values()] + [update['id']])
            after = assert_integrity(connection)
            # No record insertion/deletion; every untouched field must survive unchanged.
            permitted = {(u['table'], u['id']): set(u['fields']) for u in report['updates']}
            for table in TABLES:
                if [r['id'] for r in before[table]] != [r['id'] for r in after[table]]:
                    raise ValueError('Unexpected record count/ID change')
                for old, new in zip(before[table], after[table]):
                    if any(old[k] != new[k] for k in old if k not in permitted.get((table, old['id']), set())):
                        raise ValueError('Unexpected unrelated field change')
            connection.commit()
        except Exception:
            connection.rollback()
            raise
    log = {**report, 'applied': True, 'appliedAt': stamp, 'backup': str(backup), 'afterFingerprint': digest(after)}
    # No schema changes: an append-only, versioned sidecar audit log accompanies the DB.
    log_path = database.with_name(database.name + '.migrations.jsonl')
    with log_path.open('a', encoding='utf-8') as file:
        file.write(json.dumps(log, ensure_ascii=False) + '\n')
    return log

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', required=True, type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--dry-run', action='store_true')
    mode.add_argument('--apply', action='store_true')
    parser.add_argument('--approve-plan')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    if args.report and (args.report.suffix.lower() != '.json' or args.report.resolve() == args.database.resolve()):
        parser.error('--report must be a separate .json file; the database cannot be a report destination')
    try:
        report = run(args.database, args.apply, args.approve_plan)
    except (ValueError, sqlite3.Error, OSError) as error:
        parser.exit(1, f'Migration refused: {error}\n')
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key not in ['updates', 'alreadyApplied']}, indent=2, ensure_ascii=False))
    print(f"Planned row updates: {len(report['updates'])}; already applied: {len(report['alreadyApplied'])}")

if __name__ == '__main__':
    main()
