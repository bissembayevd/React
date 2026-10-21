"""Download the explicitly reviewed Commons selections, retaining license metadata."""
import html
import json
import re
from pathlib import Path
import httpx

ROOT = Path(__file__).resolve().parents[1]
SELECTIONS = {
    'cologne': ('Cologne skyline', 0), 'katowice': ('Katowice city centre', 1),
    'paris': ('Paris Eiffel Tower', 0), 'copenhagen': ('Copenhagen Nyhavn', 0),
    'dallas': ('Dallas skyline', 0), 'rio': ('Rio de Janeiro city', 0),
    'astana': ('Astana skyline', 0), 'stockholm': ('Stockholm city', 0),
    'sydney': ('Sydney harbour', 0), 'shanghai': ('Shanghai skyline', 0),
    'ulaanbaatar': ('Ulaanbaatar panorama filetype:bitmap', 1), 'lisbon': ('Lisbon city', 1),
    'cs-stage-01': ('Counter-Strike tournament filetype:bitmap', 0),
    'cs-stage-03': ('Counter-Strike tournament filetype:bitmap', 1),
    'gaming-setup': ('gaming keyboard setup', 0),
    'aleksib-2019': ('Aleksi Virolainen filetype:bitmap', 1),
    'apex-2019': ('Dan Madesclaire filetype:bitmap', 0),
    'ropz-2023': ('Robin Kool filetype:bitmap', 0),
    'zywoo-2019': ('Mathieu Herbaut ZywOo', 0),
}

def plain(value):
    return html.unescape(re.sub('<[^>]+>', '', value)).strip()

if __name__ == '__main__':
    research = json.loads(Path(__file__).with_name('commons-research.json').read_text(encoding='utf-8'))
    folder = ROOT / 'public/images/photos'
    folder.mkdir(parents=True, exist_ok=True)
    credits = []
    with httpx.Client(timeout=60, follow_redirects=True, headers={'User-Agent': 'CS2ArenaUniversity/1.0 (licensed local assets)'}) as client:
        for slug, (query, index) in SELECTIONS.items():
            page = list(research[query].values())[index]
            info = page['imageinfo'][0]
            meta = info['extmetadata']
            license_name = meta['LicenseShortName']['value']
            if license_name not in ['CC BY 2.0', 'CC BY 3.0', 'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC0', 'Public domain']:
                raise ValueError(f'License not reviewed: {slug}: {license_name}')
            file = folder / (slug + '.jpg')
            url = info.get('thumburl', info['url'])
            if not file.exists():
                response = client.get(url)
                response.raise_for_status()
                if not response.headers.get('content-type', '').startswith('image/jpeg'):
                    raise ValueError(f'Expected JPEG: {slug}')
                file.write_bytes(response.content)
            credits.append({'name': slug, 'path': '/images/photos/' + file.name,
                'title': page['title'], 'author': plain(meta.get('Artist', {}).get('value', '')),
                'license': license_name, 'licenseUrl': meta.get('LicenseUrl', {}).get('value', 'https://creativecommons.org/publicdomain/zero/1.0/'),
                'source': info['descriptionurl'], 'download': url,
                'description': plain(meta.get('ImageDescription', {}).get('value', '')),
                'changes': 'Commons thumbnail, CSS cover crop and dark overlay only; no changes to downloaded pixels.',
                'reviewedAt': '2026-10-19'})
            (folder / 'credits.json').write_text(json.dumps(credits, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            print(f'Saved {slug}: {license_name}', flush=True)
