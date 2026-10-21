import './helpers/backendFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getMatches, getTeams, getTournaments, getMatchById, getTournamentById } from '../src/services/api.js';
import { selectMatches, selectTournaments, relatedMatches } from '../src/utils/competitionDirectory.js';

test('match tabs, tournament filters, sorting and pagination compose without mutations', async () => {
  const [matches, teams, tournaments] = await Promise.all([getMatches(), getTeams(), getTournaments()]);
  const original = JSON.stringify(matches);
  const upcoming = selectMatches(matches);
  const results = selectMatches(matches, { tab: 'results', sort: 'date-desc' });
  assert.equal(upcoming.total, 22);
  assert.equal(results.total, 18);
  assert.deepEqual([1, 2, 3].map((page) => selectMatches(matches, { page }).items.length), [10, 10, 2]);
  assert.deepEqual([1, 2].map((page) => selectMatches(matches, { page, tab: 'results' }).items.length), [10, 8]);
  const allUpcoming = [1, 2, 3].flatMap((page) => selectMatches(matches, { page }).items);
  assert.equal(new Set(allUpcoming.map((match) => match.id)).size, 22);
  assert.ok(allUpcoming.every((match) => match.status === 'upcoming' && match.score1 === null && match.score2 === null));
  assert.ok(results.items.every((match) => match.status === 'completed' && Number.isInteger(match.score1) && Number.isInteger(match.score2) && match.score1 !== match.score2));
  for (const sort of ['date-asc', 'date-desc']) {
    const sorted = [1, 2, 3].flatMap((page) => selectMatches(matches, { sort, page }).items);
    sorted.slice(1).forEach((match, index) => assert.ok(sort === 'date-asc' ? sorted[index].startTime <= match.startTime : sorted[index].startTime >= match.startTime));
  }
  const target = allUpcoming[0];
  const combined = selectMatches(matches, { tournament: target.tournamentId, sort: 'date-desc', page: 3 });
  assert.equal(combined.page, 1);
  assert.ok(combined.items.some((match) => match.id === target.id));
  assert.ok(combined.items.every((match) => match.tournamentId === target.tournamentId));
  assert.equal(selectMatches(matches, { tournament: 'missing' }).total, 0);
  assert.deepEqual(selectMatches([]).items, []);
  for (const match of matches) assert.ok(tournaments.some((item) => item.id === match.tournamentId));
  assert.equal(JSON.stringify(matches), original);
});

test('tournament status/date order, pagination and related match IDs are correct', async () => {
  const [tournaments, matches] = await Promise.all([getTournaments(), getMatches()]);
  const original = JSON.stringify(tournaments);
  assert.equal(tournaments.length, 12);
  assert.deepEqual([1, 2].map((page) => selectTournaments(tournaments, { page }).items.length), [6, 6]);
  assert.equal(new Set([1, 2].flatMap((page) => selectTournaments(tournaments, { page }).items.map((item) => item.id))).size, 12);
  for (const sort of ['date-asc', 'date-desc']) {
    const sorted = [1, 2].flatMap((page) => selectTournaments(tournaments, { sort, page }).items);
    sorted.slice(1).forEach((item, index) => assert.ok(sort === 'date-asc' ? sorted[index].startDate <= item.startDate : sorted[index].startDate >= item.startDate));
  }
  for (const status of ['upcoming', 'ongoing', 'completed']) {
    const selected = selectTournaments(tournaments, { status });
    assert.ok(selected.items.every((item) => item.status === status));
  }
  const target = tournaments[0];
  const combined = selectTournaments(tournaments, { status: target.status, sort: 'date-desc', page: 2 });
  assert.equal(combined.page, 1);
  assert.ok(combined.items.every((item) => item.status === target.status));
  assert.equal(selectTournaments(tournaments, { status: 'missing' }).total, 0);
  assert.deepEqual(selectTournaments([]).items, []);
  for (const tournament of tournaments) assert.deepEqual(relatedMatches(matches, tournament.id).map((match) => match.id).sort(), matches.filter((match) => match.tournamentId === tournament.id).map((match) => match.id).sort());
  assert.deepEqual(relatedMatches(matches, 'tournament-12'), []);
  assert.equal(JSON.stringify(tournaments), original);
});

test('competition details resolve API IDs and reject unknown IDs', async () => {
  const [matches, tournaments] = await Promise.all([getMatches(), getTournaments()]);
  assert.deepEqual(await getMatchById(matches[0].id), matches[0]);
  assert.deepEqual(await getTournamentById(tournaments[0].id), tournaments[0]);
  await assert.rejects(getMatchById('missing-match'), { code: 'NOT_FOUND' });
  await assert.rejects(getTournamentById('missing-tournament'), { code: 'NOT_FOUND' });
});
