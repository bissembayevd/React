"""Research only: save Commons metadata for human review before downloading."""
import json
import time
from pathlib import Path
import httpx

QUERIES = ['Cologne skyline', 'Katowice city centre', 'Paris Eiffel Tower', 'Copenhagen Nyhavn', 'Dallas skyline', 'Rio de Janeiro city', 'Astana skyline', 'Stockholm city', 'Sydney harbour', 'Shanghai skyline', 'Ulaanbaatar city', 'Lisbon city', 'Counter Strike tournament stage', 'esports audience', 'gaming keyboard setup', 'Mathieu Herbaut ZywOo', 'Ulaanbaatar panorama filetype:bitmap', 'IEM Cologne stage filetype:bitmap', 'ESL One Cologne arena filetype:bitmap', 'Counter-Strike tournament filetype:bitmap', 'Aleksi Virolainen filetype:bitmap', 'Valerii Vakhovskyi filetype:bitmap', 'Ihor Zhdanov filetype:bitmap', 'Mihai Ivan Counter-Strike filetype:bitmap', 'Dan Madesclaire filetype:bitmap', 'Robin Kool filetype:bitmap', 'William Merriman filetype:bitmap', 'Shahar Shushan filetype:bitmap']

if __name__ == '__main__':
    output = Path(__file__).with_name('commons-research.json')
    results = json.loads(output.read_text(encoding='utf-8')) if output.exists() else {}
    with httpx.Client(timeout=30, follow_redirects=True, headers={'User-Agent': 'CS2ArenaUniversity/1.0 (licensed asset research)'}) as client:
        for query in QUERIES:
            if query in results: continue
            time.sleep(2)
            response = client.get('https://commons.wikimedia.org/w/api.php', params={'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': query, 'gsrnamespace': 6, 'gsrlimit': 2, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 1200})
            if response.status_code == 429:
                print('Rate limited; saved completed research. Retry later.'); break
            response.raise_for_status()
            results[query] = response.json().get('query', {}).get('pages', {})
            output.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
            for page in results[query].values():
                meta = page.get('imageinfo', [{}])[0].get('extmetadata', {})
                print(query, page['title'], meta.get('LicenseShortName', {}).get('value'), flush=True)
    Path(__file__).with_name('commons-research.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
