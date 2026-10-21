"""Retrieve the unmodified logo supplied by G2's official media guidelines."""
import json
from pathlib import Path
import httpx

root = Path(__file__).resolve().parents[1]
url = 'https://g2esports.com/cdn/shop/files/G2-Esports-2020-Logo_87bf0678-e67f-4834-8b09-e56137ffaa80.png?v=1641913940'
response = httpx.get(url, follow_redirects=True)
response.raise_for_status()
(root / 'public/images/teams/g2.png').write_bytes(response.content)
file = root / 'public/images/team-credits.json'
credits = json.loads(file.read_text(encoding='utf-8'))
credits = [item for item in credits if item['name'] != 'g2']
credits.append({'name': 'g2', 'path': '/images/teams/g2.png', 'author': 'G2 Esports',
    'license': 'Official media brand guidelines (not an open copyright license)',
    'licenseUrl': 'https://g2esports.com/pages/brand-guidelines',
    'source': 'https://g2esports.com/pages/brand-guidelines', 'download': url,
    'changes': 'None. Original proportions and colors, no filters or effects. Used only to identify the team in this demo portal.'})
file.write_text(json.dumps(credits, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print('Saved official G2 logo and media-use guidelines attribution.')
