import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAM_LOGOS, teamLogoSources, teamInitials } from '../src/config/teamLogos.js';

test('all 24 stable team IDs have editable filename entries', () => {
  assert.deepEqual(Object.keys(TEAM_LOGOS), Array.from({ length: 24 }, (_, i) => `team-${String(i + 1).padStart(2, '0')}`));
  assert.ok(Object.values(TEAM_LOGOS).every((value) => typeof value === 'string'));
});

test('manual logos use their stable ID and preserve valid API fallbacks without mutating data', () => {
  const team = { id: 'team-01', name: 'Natus Vincere', logo: '/images/teams/navi.svg' };
  const before = JSON.stringify(team);
  assert.deepEqual(teamLogoSources(team, {}), [team.logo]);
  for (const extension of ['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg']) {
    assert.deepEqual(teamLogoSources(team, { 'team-01': `my logo.${extension}` }), [`/images/teams/my%20logo.${extension}`, team.logo]);
  }
  assert.deepEqual(teamLogoSources(team, { 'team-02': 'other.png' }), [team.logo]);
  assert.equal(JSON.stringify(team), before);
});

test('generic white placeholders are replaced with dark initials, with no duplicate sources', () => {
  for (const logo of ['', '/images/team-placeholder.svg', '/images/teams/neutral-team-02.svg']) {
    assert.deepEqual(teamLogoSources({ id: 'team-02', logo }, {}), []);
  }
  assert.deepEqual(teamLogoSources({ id: 'team-01', logo: '/images/teams/navi.svg' }, { 'team-01': 'navi.svg' }), ['/images/teams/navi.svg']);
  assert.equal(teamInitials('FaZe'), 'FAZ');
  assert.equal(teamInitials('Natus Vincere'), 'NV');
  assert.equal(teamInitials('G2'), 'G2');
  assert.equal(teamInitials(), '?');
});
