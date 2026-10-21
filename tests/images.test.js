import test from 'node:test';
import assert from 'node:assert/strict';
import { imageCandidates, EMERGENCY_IMAGE } from '../src/utils/imageSources.js';

test('image fallback order is finite, deduplicates files, and survives absent URLs', () => {
  assert.deepEqual(imageCandidates('/broken.png', '/fallback.svg'), ['/broken.png', '/fallback.svg', EMERGENCY_IMAGE]);
  assert.deepEqual(imageCandidates('/same.svg', '/same.svg'), ['/same.svg', EMERGENCY_IMAGE]);
  assert.deepEqual(imageCandidates(null, '/fallback.svg'), ['/fallback.svg', EMERGENCY_IMAGE]);
  assert.deepEqual(imageCandidates(null, null), [EMERGENCY_IMAGE]);
  assert.ok(EMERGENCY_IMAGE.startsWith('data:image/svg+xml,'));
});
