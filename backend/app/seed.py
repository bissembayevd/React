import json
from pathlib import Path

from . import models

SEED_PATH = Path(__file__).with_name('seed_data.json')


def validate_seed(data):
    expected = {'players': 150, 'teams': 24, 'news': 30, 'matches': 40, 'tournaments': 12}
    for key, count in expected.items():
        if len(data[key]) != count or len({row['id'] for row in data[key]}) != count:
            raise ValueError(f'Invalid {key} seed counts or IDs.')
    teams = {row['id']: row for row in data['teams']}
    tournaments = {row['id'] for row in data['tournaments']}
    active = [row for row in data['players'] if row['status'] == 'active']
    free = [row for row in data['players'] if row['status'] == 'free-agent']
    if len(active) != 120 or len(free) != 30 or any(row['teamId'] is not None for row in free):
        raise ValueError('Invalid active/free-agent seed allocation.')
    if any(row['teamId'] not in teams for row in active):
        raise ValueError('Unknown seed player team ID.')
    if len({row['nickname'].casefold() for row in data['players']}) != 150:
        raise ValueError('Duplicate seed nicknames.')
    for team in teams.values():
        ids = [row['id'] for row in active if row['teamId'] == team['id']]
        if len(ids) != 5 or len(team['playerIds']) != 5 or set(ids) != set(team['playerIds']):
            raise ValueError('Invalid five-player seed roster.')
    for match in data['matches']:
        if match['team1Id'] not in teams or match['team2Id'] not in teams or match['tournamentId'] not in tournaments:
            raise ValueError('Invalid match seed relationship.')
    if any(row['relatedTeamId'] is not None and row['relatedTeamId'] not in teams for row in data['news']):
        raise ValueError('Invalid news seed relationship.')


def seed_database(session):
    """Insert missing IDs in dependency order. Never update or delete existing rows."""
    data = json.loads(SEED_PATH.read_text(encoding='utf-8'))
    validate_seed(data)
    for key, model in [('teams', models.Team), ('tournaments', models.Tournament), ('players', models.Player), ('news', models.News), ('matches', models.Match)]:
        for original in data[key]:
            if session.get(model, original['id']) is not None:
                continue
            record = dict(original)
            if model is models.Team:
                record.pop('playerIds')
            if model is models.Player:
                record['nickname_key'] = record['nickname'].casefold()
            session.add(model(**record))
        session.flush()
    session.commit()
