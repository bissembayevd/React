export function paginate(items, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, pageCount));
  const start = (currentPage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page: currentPage, pageCount, start };
}

export function selectMatches(matches, { tab = 'upcoming', tournament = '', sort = 'date-asc', page = 1 } = {}) {
  const filtered = matches.filter((match) => match.status === (tab === 'results' ? 'completed' : 'upcoming') && (!tournament || match.tournamentId === tournament));
  filtered.sort((a, b) => (sort === 'date-desc' ? Date.parse(b.startTime) - Date.parse(a.startTime) : Date.parse(a.startTime) - Date.parse(b.startTime)) || a.id.localeCompare(b.id));
  return paginate(filtered, page, 10);
}

export function selectTournaments(tournaments, { status = '', sort = 'date-asc', page = 1 } = {}) {
  const filtered = tournaments.filter((item) => (!status || item.status === status));
  filtered.sort((a, b) => (sort === 'date-desc' ? Date.parse(b.startDate) - Date.parse(a.startDate) : Date.parse(a.startDate) - Date.parse(b.startDate)) || a.id.localeCompare(b.id));
  return paginate(filtered, page, 6);
}

export function relatedMatches(matches, tournamentId) {
  return matches.filter((match) => match.tournamentId === tournamentId).sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime) || a.id.localeCompare(b.id));
}
