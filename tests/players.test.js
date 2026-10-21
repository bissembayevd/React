import './helpers/backendFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlayers, getPlayerById, getTeamById, addPlayer, PLAYER_ROLES } from '../src/services/api.js';
import { getFreeAgents, getPlayerCountries, selectFreeAgents } from '../src/utils/playerDirectory.js';
import { validatePlayerForm, toPlayerData } from '../src/utils/playerForm.js';
import { PLAYER_COUNTRIES } from '../src/data/countries.js';

const valid = { nickname: ' TestTalent ', firstName: ' Alex ', lastName: ' Demo ', nationality: ' Kazakhstan ', age: '22', role: 'Rifler', rating: '1.15' };

test('free agents: eligibility, search, country/role filters, sorting and pagination together', async () => {
  const players = await getPlayers();
  const original = JSON.stringify(players);
  const free = getFreeAgents(players);
  assert.equal(free.length, 30);
  assert.equal(getFreeAgents([{ ...free[0], teamId: 'team-01' }, { ...free[0], status: 'active' }]).length, 0);
  assert.deepEqual([1, 2, 3].map((page) => selectFreeAgents(players, { page }).items.length), [10, 10, 10]);
  assert.equal(new Set([1, 2, 3].flatMap((page) => selectFreeAgents(players, { page }).items.map((player) => player.id))).size, 30);
  assert.deepEqual(getPlayerCountries(players), [...new Set(free.map((player) => player.nationality))].sort((a, b) => a.localeCompare(b)));
  assert.equal(selectFreeAgents(players, { search: ` ${free[0].nickname.toUpperCase()} ` }).items[0].id, free[0].id);
  for (const sort of ['rating-desc', 'rating-asc', 'nickname']) {
    const sorted = [1, 2, 3].flatMap((page) => selectFreeAgents(players, { sort, page }).items);
    sorted.slice(1).forEach((player, index) => {
      if (sort === 'nickname') assert.ok(sorted[index].nickname.localeCompare(player.nickname) <= 0);
      else if (sort === 'rating-asc') assert.ok(sorted[index].rating <= player.rating);
      else assert.ok(sorted[index].rating >= player.rating);
    });
  }
  const sample = free[0];
  const combined = selectFreeAgents(players, { search: sample.nickname.slice(0, 3), country: sample.nationality, role: sample.role, sort: 'rating-asc', page: 3 });
  assert.equal(combined.page, 1);
  assert.ok(combined.items.some((player) => player.id === sample.id));
  assert.ok(combined.items.every((player) => player.nationality === sample.nationality && player.role === sample.role));
  assert.equal(selectFreeAgents(players, { search: 'nonexistent-player' }).total, 0);
  assert.deepEqual(selectFreeAgents([]).items, []);
  assert.equal(JSON.stringify(players), original);
});

test('controlled form validates required fields, numeric boundaries and supported roles', () => {
  assert.deepEqual(validatePlayerForm(valid, PLAYER_ROLES), {});
  for (const field of Object.keys(valid)) assert.ok(validatePlayerForm({ ...valid, [field]: ' ' }, PLAYER_ROLES)[field]);
  for (const age of ['15', '46', '22.5', 'NaN', 'Infinity']) assert.ok(validatePlayerForm({ ...valid, age }, PLAYER_ROLES).age);
  for (const age of ['16', '45']) assert.equal(validatePlayerForm({ ...valid, age }, PLAYER_ROLES).age, undefined);
  for (const rating of ['-0.01', '3.01', 'NaN', 'Infinity']) assert.ok(validatePlayerForm({ ...valid, rating }, PLAYER_ROLES).rating);
  for (const rating of ['0', '3', '1.123']) assert.equal(validatePlayerForm({ ...valid, rating }, PLAYER_ROLES).rating, undefined);
  assert.ok(validatePlayerForm({ ...valid, nickname: 'x'.repeat(81) }, PLAYER_ROLES).nickname);
  assert.ok(validatePlayerForm({ ...valid, role: 'Unknown' }, PLAYER_ROLES).role);
  assert.ok(validatePlayerForm({ ...valid, nationality: 'Not a country' }, PLAYER_ROLES).nationality);
  assert.equal(new Set(PLAYER_COUNTRIES).size, PLAYER_COUNTRIES.length);
  for (const country of ['Kazakhstan', 'Ukraine', 'Russia', 'Denmark', 'France', 'Germany', 'Brazil', 'United States']) assert.ok(PLAYER_COUNTRIES.includes(country));
  assert.deepEqual(toPlayerData(valid), { nickname: 'TestTalent', firstName: 'Alex', lastName: 'Demo', nationality: 'Kazakhstan', age: 22, role: 'Rifler', rating: 1.15, status: 'free-agent', teamId: null });
});

test('validated form creates a discoverable persisted free agent, including rating zero', async () => {
  const player = await addPlayer(toPlayerData({ ...valid, rating: '0' }));
  assert.equal(player.teamId, null);
  assert.equal(player.status, 'free-agent');
  assert.equal(player.rating, 0);
  assert.equal(player.nationality, 'Kazakhstan');
  assert.equal((await getPlayerById(player.id)).id, player.id);
  const reloaded = await import('../src/services/api.js?player-form-reload');
  assert.deepEqual(await reloaded.getPlayerById(player.id), player);
  const directory = selectFreeAgents(await reloaded.getPlayers(), { search: player.nickname, country: player.nationality, role: player.role });
  assert.equal(directory.items[0].id, player.id);
  await assert.rejects(addPlayer(toPlayerData(valid)), { code: 'DUPLICATE_PLAYER' });
  const active = await getPlayerById('player-001');
  assert.ok((await getTeamById(active.teamId)).playerIds.includes(active.id));
  await assert.rejects(getPlayerById('missing-player'), { code: 'NOT_FOUND' });
});
