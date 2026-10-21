"""Presentation-only asset selection. Never changes ORM records or seed data."""
import json
from pathlib import Path

SNAPSHOT = json.loads(Path(__file__).with_name('roster_snapshot.json').read_text(encoding='utf-8'))
VERIFIED = {player['id']: (team, player) for team in SNAPSHOT['teams'] for player in team['players']}

TEAM_LOGOS = {
    'Natus Vincere': 'navi.svg', 'Spirit': 'spirit.svg', 'FaZe': 'faze.svg',
    'G2': 'g2.png', 'MOUZ': 'mouz.png', 'Astralis': 'astralis.png', 'FlyQuest': 'flyquest.svg',
}
NEWS_ART = {'Team News': 'team-news', 'Transfers': 'transfers', 'Match Preview': 'match-preview', 'Tournament': 'tournament', 'Analysis': 'analysis'}


def present(record, schema):
    """Keep response shapes unchanged, replacing only legacy placeholder URLs."""
    data = schema.model_validate(record)
    values = data.model_dump()
    variant = sum(record.id.encode('utf-8'))
    if 'provenance' in values and record.id in VERIFIED:
        team, player = VERIFIED[record.id]
        if record.status == 'active' and record.teamId == team['teamId'] and all(getattr(record, key) == value for key, value in player.items() if key not in ['id', 'image']):
            data = data.model_copy(update={'provenance': {'snapshotDate': SNAPSHOT['snapshotDate'], 'source': team['source'], 'roleVerified': 'role' in player, 'photoYear': (2023 if player['nickname'] == 'ropz' else 2019) if '/photos/' in player.get('image', '') else None}})
    portraits = {player['image'] for _, player in VERIFIED.values() if 'image' in player}
    if 'provenance' in values and not data.provenance and values.get('image') in portraits:
        return data.model_copy(update={'image': '/images/player-placeholder.svg'})
    if values.get('logo') == '/images/team-placeholder.svg':
        filename = TEAM_LOGOS.get(record.name)
        if filename:
            return data.model_copy(update={'logo': '/images/teams/' + filename})
        if record.id in {f'team-{index:02}' for index in range(1, 25)}:
            return data.model_copy(update={'logo': f'/images/teams/neutral-{record.id}.svg'})
    if values.get('image') == '/images/player-placeholder.svg':
        return data
    if values.get('image') == '/images/news-placeholder.svg':
        kind = NEWS_ART.get(record.category, 'team-news')
        return data.model_copy(update={'image': f'/images/editorial/{kind}-{variant % 2}.svg'})
    if values.get('image') == '/images/tournament-placeholder.svg':
        kind = next((name for name in ['masters', 'open', 'invitational'] if name in record.name.lower()), 'masters')
        return data.model_copy(update={'image': f'/images/tournaments/{kind}-{variant % 2}.svg'})
    return data
