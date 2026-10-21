import json
from pathlib import Path
from types import SimpleNamespace
import unittest
import xml.etree.ElementTree as ET

from app import schemas
from app.media import present
from app.seed import SEED_PATH

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'


class MediaTests(unittest.TestCase):
    def test_all_asset_paths_exist_and_nonvisual_fields_are_unchanged(self):
        data = json.loads(SEED_PATH.read_text(encoding='utf-8'))
        schemas_by_entity = {'players': schemas.PlayerOut, 'teams': schemas.TeamOut, 'news': schemas.NewsOut, 'matches': schemas.MatchOut, 'tournaments': schemas.TournamentOut}
        for entity, schema in schemas_by_entity.items():
            paths = set()
            for source in data[entity]:
                record = SimpleNamespace(**source)
                result = present(record, schema).model_dump()
                field = 'logo' if entity == 'teams' else 'image' if entity != 'matches' else None
                expected = dict(source)
                if entity == 'players': expected['provenance'] = None
                if field:
                    asset = result[field]
                    self.assertTrue((PUBLIC / asset.lstrip('/')).is_file(), asset)
                    paths.add(asset)
                    expected[field] = asset
                self.assertEqual(result, expected)
                self.assertEqual(record.__dict__, source)
            if entity in ['news', 'tournaments']:
                self.assertGreater(len(paths), 1)

    def test_custom_player_image_and_record_are_not_overwritten(self):
        source = json.loads(SEED_PATH.read_text(encoding='utf-8'))['players'][0]
        source['image'] = '/images/custom-upload.png'
        record = SimpleNamespace(**source)
        self.assertEqual(present(record, schemas.PlayerOut).image, source['image'])
        source['image'] = '/images/player-placeholder.svg'
        record = SimpleNamespace(**source)
        first = present(record, schemas.PlayerOut).image
        self.assertEqual(present(record, schemas.PlayerOut).image, first)
        self.assertEqual(record.image, '/images/player-placeholder.svg')

    def test_bundled_svg_safety_and_credits(self):
        for file in (PUBLIC / 'images').rglob('*.svg'):
            root = ET.parse(file).getroot()
            for element in root.iter():
                self.assertNotEqual(element.tag.split('}')[-1], 'script', str(file))
                for name, value in element.attrib.items():
                    self.assertFalse(name.lower().startswith('on'), str(file))
                    if name.split('}')[-1] == 'href':
                        self.assertFalse(value.startswith(('http:', 'https:', 'javascript:')), str(file))
        credits = json.loads((PUBLIC / 'images/team-credits.json').read_text(encoding='utf-8'))
        self.assertGreaterEqual(len(credits), 7)
        for item in credits:
            self.assertTrue((PUBLIC / item['path'].lstrip('/')).is_file())
            self.assertTrue(item['author'] and item['source'] and item['license'] and item['licenseUrl'])
        self.assertTrue((PUBLIC / 'asset-credits.html').is_file())

    def test_reviewed_photographs_have_local_files_and_complete_attribution(self):
        from app.migrate_content import targets
        credits = json.loads((PUBLIC / 'images/photos/credits.json').read_text(encoding='utf-8'))
        self.assertEqual(len(credits), 19)
        credited = {item['path'] for item in credits}
        for item in credits:
            self.assertTrue(all(item.get(field) for field in ['author', 'source', 'license', 'licenseUrl', 'description', 'changes']))
            file = PUBLIC / item['path'].lstrip('/')
            self.assertTrue(file.read_bytes().startswith(b'\xff\xd8\xff'), str(file))
        for _, _, values in targets():
            if '/images/photos/' in values.get('image', ''):
                self.assertIn(values['image'], credited)
        placeholder = (PUBLIC / 'images/player-placeholder.svg').read_text(encoding='utf-8')
        self.assertIn('>?</text>', placeholder)
        self.assertNotIn('gradient', placeholder.lower())

    def test_real_portrait_requires_matching_verified_identity(self):
        source = json.loads(SEED_PATH.read_text(encoding='utf-8'))['players'][0]
        source['image'] = '/images/photos/aleksib-2019.jpg'
        result = present(SimpleNamespace(**source), schemas.PlayerOut)
        self.assertIsNone(result.provenance)
        self.assertEqual(result.image, '/images/player-placeholder.svg')


if __name__ == '__main__':
    unittest.main()
