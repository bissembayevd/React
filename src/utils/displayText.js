// Presentation markers only. API values and database records stay untouched.
// Do not use this to rewrite article prose or arbitrary occurrences of a word.
export function withoutEditionMarker(value = '') {
  return value.replace(/^\[demo\]\s*/i, '').replace(/\s*[—–-]\s*demo\s*$/i, '');
}

export function articleParagraphs(content = '') {
  // Exact stock paragraphs only; never discard custom prose because of a keyword.
  const boilerplate = new Set([
    'Fictional CS2 demo data. Rosters, statistics, rankings, results and schedules are not real or current.',
    'This sample article gives the portal realistic reading content without reporting actual events. Future pages can connect the story to its team using relatedTeamId.',
  ]);
  return content.split(/\n\s*\n/).filter((paragraph) => paragraph.trim() && !boilerplate.has(paragraph.trim()));
}

export function articleSummary(summary = '') {
  const stockSummary = /^A fictional (?:team news|transfers|match preview|tournament|analysis) story exploring .+'s journey in the CS2 ARENA demo competition\.$/;
  return stockSummary.test(summary.trim()) ? '' : summary;
}

export function teamOverviewText(description = '') {
  // Remove the original generated notice only; keep any manually appended prose.
  return description
    .replace(/^Verified roster snapshot: \d{4}-\d{2}-\d{2}\. Source: https?:\/\/\S+\. Rankings, ages, ratings and competition data remain fictional demo values\. This is a dated snapshot, not a live roster feed\./, '')
    .replace(/^.+? is featured in CS2 ARENA's fictional competition\. This five-player demo roster and ranking do not represent the real team\. The country\/region is a demo organization label, not the players' nationality\./, '')
    .trim();
}
