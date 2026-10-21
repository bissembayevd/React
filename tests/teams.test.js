import './helpers/backendFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getTeams, getPlayers } from '../src/services/api.js';
import { getTeamCountries, selectTeams, getTeamRoster } from '../src/utils/teamDirectory.js';

test('team directory: search, derived countries, sorting, pagination, combined controls', async () => {
  const teams = await getTeams();
  const original = JSON.stringify(teams);
  assert.equal(teams.length, 24);
  assert.deepEqual([1, 2, 3].map((page) => selectTeams(teams, { page }).items.length), [10, 10, 4]);
  assert.equal(new Set([1, 2, 3].flatMap((page) => selectTeams(teams, { page }).items.map((team) => team.id))).size, 24);
  assert.equal(selectTeams(teams, { search: '  VITAL ' }).items[0].name, 'Vitality');
  assert.equal(selectTeams(teams, { search: 'no-such-team' }).total, 0);
  const countries = getTeamCountries(teams);
  assert.equal(new Set(countries).size, countries.length);
  assert.deepEqual(countries, [...new Set(teams.map((team) => team.country))].sort((a, b) => a.localeCompare(b)));
  for (const country of countries) assert.ok(selectTeams(teams, { country }).items.every((team) => team.country === country));
  for (const sort of ['ranking', 'name-asc', 'name-desc']) {
    const all = [1, 2, 3].flatMap((page) => selectTeams(teams, { sort, page }).items);
    all.slice(1).forEach((team, index) => {
      if (sort === 'ranking') assert.ok(all[index].ranking <= team.ranking);
      else assert.ok((sort === 'name-asc' ? all[index].name.localeCompare(team.name) : team.name.localeCompare(all[index].name)) <= 0);
    });
  }
  const combined = selectTeams(teams, { search: 'i', country: 'Brazil', sort: 'name-desc', page: 3 });
  assert.deepEqual(combined.items.map((team) => team.name), ['paiN', 'Imperial', 'FURIA']);
  assert.equal(combined.page, 1);
  assert.equal(combined.pageCount, 1);
  assert.deepEqual(selectTeams([], {}).items, []);
  assert.equal(JSON.stringify(teams), original);
});

test('every team roster resolves exactly its related players, and empty rosters work', async () => {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()]);
  for (const team of teams) {
    const roster = getTeamRoster(team, players);
    assert.equal(roster.length, 5);
    assert.deepEqual(roster.map((player) => player.id), team.playerIds);
    assert.ok(roster.every((player) => player.teamId === team.id && player.status === 'active'));
  }
  assert.deepEqual(getTeamRoster({ id: 'empty', playerIds: [] }, players), []);
});
