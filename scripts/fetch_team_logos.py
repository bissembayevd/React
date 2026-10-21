"""Download only Commons files with explicit free/PD metadata; keep source credits."""
import html
import json
import re
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/images/teams'
CANDIDATES = {
    'navi': 'NAVI-Logo.svg', 'spirit': 'Team Spirit new em.svg', 'faze': 'Faze Clan.svg',
    'mouz': 'MOUZlogo2021.png', 'astralis': 'Astralis 3.png',
    'g2': 'Esports organization G2 Esports logo.svg', 'vitality': 'Team Vitality logo.svg',
    'liquid': 'Team Liquid logo.svg', 'furia': 'FURIA Esports logo.svg',
    'nip': 'Ninjas in Pyjamas logo.svg', 'big': 'BIG logo.svg',
    'ence': 'ENCE logo.svg', 'heroic': 'Heroic logo.svg', 'flyquest': 'Flyquest logo.svg',
    'complexity': 'Complexity Gaming logo.svg', 'imperial': 'Imperial Esports logo.svg',
    'pain': 'Pain Gaming logo.svg', 'gamerlegion': 'GamerLegion logo.svg',
}


def plain(value):
    return html.unescape(re.sub('<[^>]+>', '', value)).strip()


if __name__ == '__main__':
    DEST.mkdir(parents=True, exist_ok=True)
    credits = []
    with httpx.Client(headers={'User-Agent': 'CS2ArenaUniversityProject/1.0 (asset attribution research)'}, follow_redirects=True, timeout=30) as client:
        response = client.get('https://commons.wikimedia.org/w/api.php', params={
            'action': 'query', 'format': 'json', 'titles': '|'.join('File:' + title for title in CANDIDATES.values()),
            'prop': 'imageinfo', 'iiprop': 'url|extmetadata',
        })
        response.raise_for_status()
        pages = {page['title'].removeprefix('File:'): page for page in response.json()['query']['pages'].values()}
        for name, title in CANDIDATES.items():
            info = pages.get(title, {}).get('imageinfo', [])
            if not info:
                print(f'Unavailable: {name}')
                continue
            info = info[0]
            meta = info.get('extmetadata', {})
            license_name = meta.get('LicenseShortName', {}).get('value', '')
            if license_name not in ['CC BY-SA 4.0', 'CC BY-SA 3.0', 'CC BY 4.0', 'CC BY 3.0', 'Public domain', 'CC0']:
                print(f'Unverified license: {name} ({license_name})')
                continue
            content = client.get(info['url'])
            content.raise_for_status()
            suffix = Path(title).suffix.lower()
            file = DEST / f'{name}{suffix}'
            file.write_bytes(content.content)
            credits.append({'name': name, 'path': '/images/teams/' + file.name,
                'author': plain(meta.get('Artist', {}).get('value', name)), 'license': license_name,
                'licenseUrl': meta.get('LicenseUrl', {}).get('value', 'https://commons.wikimedia.org/wiki/Commons:Public_domain'),
                'source': info['descriptionurl'], 'download': info['url'], 'changes': 'None; original file, scaled with CSS only.'})
            print(f'Saved: {name} ({license_name})')
    (ROOT / 'public/images/team-credits.json').write_text(json.dumps(credits, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
