import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAsset } from '../src/utils/publicAsset.js';

test('public assets support the repository base without changing remote or inline images', () => {
  for (const path of ['/images/teams/navi.svg', '/images/news/photo.jpg', '/images/player-placeholder.svg', '/favicon.svg?v=3', '/asset-credits.html']) {
    assert.equal(publicAsset(path, '/React/'), '/React' + path);
    assert.equal(publicAsset('/React' + path, '/React/'), '/React' + path);
    assert.equal(publicAsset(path, '/'), path);
  }
  for (const path of ['https://example.com/photo.jpg', '//example.com/photo.jpg', 'data:image/svg+xml,test', 'images/logo.png', '', undefined]) {
    assert.equal(publicAsset(path, '/React/'), path);
  }
});
