"""Explicit HLTV nickname migration; never executed during API startup."""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import json
from pathlib import Path
import sqlite3

from .migrate_content import connect, rows, assert_integrity, digest, SEED

MANIFEST = Path(__file__).with_name('hltv_nicknames.json')


def plan(connection):
    before = assert_integrity(connection)
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    seed = json.loads(SEED.read_text(encoding='utf-8'))
    slots = {p['id']: p for p in seed['players'] if p['status'] == 'active'}
    teams = {t['id']: t for t in before['teams']}
    assignments, conflicts, retained = [], [], []
    if {t['teamId'] for t in manifest['teams']} != set(teams):
        raise ValueError('Manifest must cover the actual database teams exactly')
    all_names = [n.casefold() for t in manifest['teams'] for n in t['nicknames']]
    if len(all_names) != len(set(all_names)):
        raise ValueError('Duplicate nicknames in manifest')
    for team in manifest['teams']:
        candidates = [p for p in before['players'] if p['id'] in slots and p['teamId'] == team['teamId'] and p['status'] == 'active' and slots[p['id']]['teamId'] == team['teamId']]
        if len(candidates) != 5 or len(team['nicknames']) > 5:
            conflicts.append(f"{team['teamId']}: original five active slots are not intact")
            continue
        # Reserve all existing real-player identities before assigning vacant demo slots.
        reserved = {nickname: next((p for p in candidates if p['nickname'].casefold() == nickname.casefold()), None) for nickname in team['nicknames']}
        used = {p['id'] for p in reserved.values() if p}
        available = iter(p for p in candidates if p['id'] not in used)
        for nickname, record in reserved.items():
            record = record or next(available)
            used.add(record['id'])
            assignments.append({'id': record['id'], 'teamId': team['teamId'], 'nickname': nickname, 'source': team['source']})
        for p in candidates:
            if p['id'] not in used:
                retained.append({'id': p['id'], 'teamId': p['teamId'], 'nickname': p['nickname'], 'reason': team['note']})
    expected = {p['id']: {**p} for p in before['players']}
    for item in assignments:
        expected[item['id']].update(nickname=item['nickname'], nickname_key=item['nickname'].casefold())
    keys = [p['nickname_key'] for p in expected.values()]
    if len(keys) != len(set(keys)):
        conflicts.append('A requested nickname conflicts with a preserved player; no merge permitted')
    updates = [{'id': p['id'], 'before': p['nickname'], 'after': expected[p['id']]['nickname']} for p in before['players'] if p['nickname'] != expected[p['id']]['nickname']]
    report = {'version': manifest['version'], 'checkedAt': manifest['checkedAt'], 'manifestHash': digest(manifest), 'databaseFingerprint': digest(before), 'counts': {t: len(v) for t, v in before.items()}, 'preservedFreeAgents': sum(p['status'] == 'free-agent' for p in before['players']), 'assignments': assignments, 'updates': updates, 'retainedUnverifiedSlots': retained, 'conflicts': conflicts}
    report['planHash'] = digest(report)
    return report


def run(database, apply=False, approved_hash=None):
    database = Path(database).resolve(strict=True)
    with closing(connect(database)) as source:
        report = plan(source)
    if not apply:
        return report
    if report['conflicts'] or report['planHash'] != approved_hash:
        raise ValueError('Conflicts or changed/unapproved dry-run plan; database untouched')
    if not report['updates']:
        return {**report, 'applied': False}
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup = database.parent / 'backups' / f'{database.stem}-hltv-nicknames-{stamp}.db'
    backup.parent.mkdir(exist_ok=True)
    with closing(connect(database, readonly=False)) as connection:
        connection.execute('BEGIN IMMEDIATE')
        try:
            if plan(connection)['planHash'] != approved_hash:
                raise ValueError('Database changed since dry run')
            before = rows(connection)
            with closing(connect(database)) as source, closing(sqlite3.connect(backup)) as destination:
                source.backup(destination)
                if destination.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                    raise ValueError('Backup integrity check failed')
                destination.row_factory = sqlite3.Row
                if digest(rows(destination)) != digest(before):
                    raise ValueError('Backup contents do not match the source')
            for update in report['updates']:
                connection.execute('UPDATE players SET nickname=?, nickname_key=? WHERE id=?', (update['after'], update['after'].casefold(), update['id']))
            after = assert_integrity(connection)
            allowed = {u['id'] for u in report['updates']}
            for table in before:
                if [r['id'] for r in before[table]] != [r['id'] for r in after[table]]:
                    raise ValueError('Record IDs changed')
                for old, new in zip(before[table], after[table]):
                    fields = {'nickname', 'nickname_key'} if table == 'players' and old['id'] in allowed else set()
                    if any(old[k] != new[k] for k in old if k not in fields):
                        raise ValueError('Unrelated data changed')
            if plan(connection)['updates']:
                raise ValueError('Migration is not idempotent')
            connection.commit()
        except Exception:
            connection.rollback()
            raise
    log = {**report, 'applied': True, 'backup': str(backup), 'appliedAt': stamp, 'afterFingerprint': digest(after)}
    with database.with_name(database.name + '.migrations.jsonl').open('a', encoding='utf-8') as file:
        file.write(json.dumps(log, ensure_ascii=False) + '\n')
    return log


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', type=Path, required=True)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--dry-run', action='store_true')
    mode.add_argument('--apply', action='store_true')
    parser.add_argument('--approve-plan')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    if args.report and (args.report.suffix.lower() != '.json' or args.report.resolve() == args.database.resolve()):
        parser.error('Report must be a separate JSON file')
    try:
        report = run(args.database, args.apply, args.approve_plan)
    except (ValueError, sqlite3.Error, OSError) as error:
        parser.exit(1, f'Migration refused: {error}\n')
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k not in ('assignments', 'updates', 'retainedUnverifiedSlots')}, ensure_ascii=False, indent=2))
    print(f"Updates: {len(report['updates'])}; retained unverified slots: {len(report['retainedUnverifiedSlots'])}")


if __name__ == '__main__':
    main()
