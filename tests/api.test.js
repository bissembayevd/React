import './helpers/backendFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/services/api.js';

const input = { nickname: 'NewTalent', firstName: 'Ayan', lastName: 'Demo', nationality: 'Kazakhstan', age: 22, role: 'Rifler', rating: 1.1, status: 'free-agent', teamId: null };

test('HTTP API list/detail shapes, initial counts and roster relationships are preserved', async () => {
  const lists = await Promise.all([api.getPlayers(), api.getTeams(), api.getNews(), api.getMatches(), api.getTournaments()]);
  assert.deepEqual(lists.map((list) => list.length), [150, 24, 30, 40, 12]);
  const [players, teams, news, matches, tournaments] = lists;
  assert.equal(new Set(lists.flat().map((item) => item.id)).size, lists.flat().length);
  const byTeam = new Map(teams.map((team) => [team.id, team]));
  const byPlayer = new Map(players.map((player) => [player.id, player]));
  for (const team of teams) {
    assert.equal(team.playerIds.length, 5);
    for (const id of team.playerIds) assert.equal(byPlayer.get(id).teamId, team.id);
  }
  assert.equal(players.filter((player) => player.status === 'free-agent' && player.teamId === null).length, 30);
  for (const player of players) if (player.status === 'active') assert.ok(byTeam.get(player.teamId).playerIds.includes(player.id));
  for (const article of news) assert.ok(article.relatedTeamId === null || byTeam.has(article.relatedTeamId));
  for (const match of matches) {
    assert.ok(byTeam.has(match.team1Id) && byTeam.has(match.team2Id));
    assert.ok(tournaments.some((item) => item.id === match.tournamentId));
    if (match.status === 'upcoming') assert.deepEqual([match.score1, match.score2], [null, null]);
  }
  const getters = [api.getPlayerById, api.getTeamById, api.getNewsById, api.getMatchById, api.getTournamentById];
  for (const [index, get] of getters.entries()) {
    assert.deepEqual(await get(lists[index][0].id), lists[index][0]);
    await assert.rejects(get('missing'), { code: 'NOT_FOUND', status: 404 });
    await assert.rejects(get(null), { code: 'INVALID_ID' });
  }
});

test('POST persists in the database, reports conflicts and readable validation errors', async () => {
  // A stale browser storage object is irrelevant to all HTTP reads/writes.
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Must not read browser storage'); } });
  try {
    const player = await api.addPlayer(input);
    assert.equal(player.status, 'free-agent');
    assert.equal(player.teamId, null);
    const reloaded = await import('../src/services/api.js?http-reload');
    assert.deepEqual(await reloaded.getPlayerById(player.id), player);
    assert.equal((await reloaded.getPlayers()).length, 151);
    await assert.rejects(api.addPlayer({ ...input, nickname: ' NEWTALENT ' }), { code: 'DUPLICATE_PLAYER', status: 409 });
    for (const change of [{ age: 46 }, { age: 15 }, { age: 22.5 }, { rating: -1 }, { rating: 4 }, { nickname: ' ' }, { status: 'active', teamId: 'team-01' }]) {
      await assert.rejects(api.addPlayer({ ...input, ...change }), (error) => error.code === 'VALIDATION_ERROR' && error.status === 422 && error.details.length > 0);
    }
    assert.equal((await api.getTeams())[0].playerIds.length, 5);
  } finally { delete globalThis.localStorage; }
});

test('fetch service supports cancellation without turning AbortError into API errors', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.getPlayers({ signal: controller.signal }), { name: 'AbortError' });
});

test('network errors and malformed responses have readable errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('connection refused'); };
    await assert.rejects(api.getPlayers(), { code: 'NETWORK_ERROR' });
    globalThis.fetch = async () => new Response('not JSON', { status: 502 });
    await assert.rejects(api.getPlayers(), { code: 'INVALID_RESPONSE', status: 502 });
  } finally { globalThis.fetch = original; }
});
