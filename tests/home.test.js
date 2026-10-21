import './helpers/backendFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { selectHomeData } from '../src/utils/homeData.js';
import { getNews, getMatches, getTeams, getTournaments } from '../src/services/api.js';

test('home selections use API records, ordered correctly without changing the source', async () => {
  const [news, matches, teams, tournaments] = await Promise.all([getNews(), getMatches(), getTeams(), getTournaments()]);
  const source = { news, matches, teams, tournaments };
  const before = JSON.stringify(source);
  const home = selectHomeData(source);
  assert.equal(home.featuredArticle.id, 'news-030');
  assert.equal(home.latestNews.length, 6);
  assert.ok(home.latestNews.every((item) => item.id !== home.featuredArticle.id));
  assert.equal(home.upcomingMatches.length, 4);
  assert.ok(home.upcomingMatches.every((match) => match.status === 'upcoming' && match.featured && match.score1 === null && match.score2 === null));
  assert.equal(home.recentResults.length, 3);
  assert.ok(home.recentResults.every((match) => match.status === 'completed'));
  const assertSorted = (items, value) => items.slice(1).forEach((item, index) => assert.ok(value(items[index]) <= value(item)));
  assertSorted([home.featuredArticle, ...home.latestNews], (item) => -Date.parse(item.publishedAt));
  assertSorted(home.upcomingMatches, (item) => Date.parse(item.startTime));
  assertSorted(home.recentResults, (item) => -Date.parse(item.startTime));
  assert.deepEqual(home.topTeams.map((team) => team.ranking), [1, 2, 3, 4, 5]);
  for (const match of [...home.upcomingMatches, ...home.recentResults]) {
    assert.ok(home.teamsById.has(match.team1Id));
    assert.ok(home.teamsById.has(match.team2Id));
    assert.ok(home.tournamentsById.has(match.tournamentId));
  }
  assert.equal(JSON.stringify(source), before);
});

test('empty and small API lists do not create fictional filler records', () => {
  const source = { news: [], matches: [], teams: [], tournaments: [] };
  const empty = selectHomeData(source);
  assert.equal(empty.featuredArticle, null);
  for (const key of ['latestNews', 'upcomingMatches', 'recentResults', 'topTeams']) assert.deepEqual(empty[key], []);
  const article = { id: 'only-article', publishedAt: '2027-01-01T00:00:00.000Z' };
  const single = selectHomeData({ ...source, news: [article] });
  assert.equal(single.featuredArticle, article);
  assert.deepEqual(single.latestNews, []);
});
