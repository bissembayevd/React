import test from 'node:test';
import assert from 'node:assert/strict';
import { NEWS_IMAGES, newsImageSources } from '../src/config/newsImages.js';
import { imageCandidates, EMERGENCY_IMAGE } from '../src/utils/imageSources.js';
import { withoutEditionMarker, teamOverviewText, articleParagraphs, articleSummary } from '../src/utils/displayText.js';

test('all 30 news IDs have independent editable filename mappings', () => {
  assert.deepEqual(Object.keys(NEWS_IMAGES), Array.from({ length: 30 }, (_, i) => `news-${String(i + 1).padStart(3, '0')}`));
  // Assigned filenames are expected after the user supplies their photographs.
  assert.ok(Object.values(NEWS_IMAGES).every((name) => typeof name === 'string'));
});

test('stock demo/sample boilerplate is hidden while custom article paragraphs and summaries survive', () => {
  const intro = 'Fictional CS2 demo data. Rosters, statistics, rankings, results and schedules are not real or current.';
  const ending = 'This sample article gives the portal realistic reading content without reporting actual events. Future pages can connect the story to its team using relatedTeamId.';
  const story = 'Our analyst reviewed a demo to study the opening round.';
  const content = `${intro}\n\n${story}\n\n${ending}`;
  assert.deepEqual(articleParagraphs(content), [story]);
  assert.equal(articleSummary("A fictional analysis story exploring MOUZ's journey in the CS2 ARENA demo competition."), '');
  assert.equal(articleSummary('Our analyst reviewed a demo.'), 'Our analyst reviewed a demo.');
  assert.equal(articleSummary('My new custom summary.'), 'My new custom summary.');
  assert.equal(articleSummary(''), '');
  assert.ok(content.endsWith(ending));
});

test('manual news filenames preserve the API image and existing terminal fallbacks', () => {
  const article = { id: 'news-001', image: '/images/photos/cs-stage-01.jpg', title: '[Demo] Existing title' };
  const before = JSON.stringify(article);
  const original = newsImageSources(article, {});
  assert.equal(original.src, article.image);
  const manual = newsImageSources(article, { 'news-001': 'navi-training.jpg', 'news-002': 'other.webp' });
  assert.equal(manual.src, '/images/news/navi-training.jpg');
  assert.deepEqual(imageCandidates(manual.src, manual.fallback), [manual.src, article.image, '/images/news-placeholder.svg', EMERGENCY_IMAGE]);
  assert.equal(newsImageSources({ ...article, id: 'news-002' }, {}).src, article.image);
  assert.equal(JSON.stringify(article), before);
});

test('edition markers are presentation-only; ordinary names and article prose are untouched', () => {
  assert.equal(withoutEditionMarker('[Demo] Existing title'), 'Existing title');
  assert.equal(withoutEditionMarker('Arena Masters Cologne — Demo'), 'Arena Masters Cologne');
  assert.equal(withoutEditionMarker('Demolition tactics'), 'Demolition tactics');
  assert.equal(withoutEditionMarker('A demo mentioned inside article prose.'), 'A demo mentioned inside article prose.');
  assert.equal(teamOverviewText('My manually edited team description.'), 'My manually edited team description.');
  const notice = 'Verified roster snapshot: 2026-10-19. Source: https://navi.gg/en/teams/cs2. Rankings, ages, ratings and competition data remain fictional demo values. This is a dated snapshot, not a live roster feed.';
  assert.equal(teamOverviewText(notice), '');
  assert.equal(teamOverviewText(notice + '\n\nMy manual description.'), 'My manual description.');
  const story = 'Keep my article prose unchanged, even if it mentions a demo.';
  assert.deepEqual(articleParagraphs('Fictional CS2 demo data. Rosters, statistics, rankings, results and schedules are not real or current.\n\n' + story), [story]);
});
