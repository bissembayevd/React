export function getFreeAgents(players) {
  return players.filter((player) => player.status === 'free-agent' && player.teamId === null);
}

export function getPlayerCountries(players) {
  return [...new Set(getFreeAgents(players).map((player) => player.nationality))].sort((a, b) => a.localeCompare(b));
}

export function selectFreeAgents(players, { search = '', country = '', role = '', sort = 'rating-desc', page = 1 } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = getFreeAgents(players).filter((player) => player.nickname.toLowerCase().includes(query) && (!country || player.nationality === country) && (!role || player.role === role));
  filtered.sort((a, b) => {
    const ratingDifference = sort === 'rating-asc' ? a.rating - b.rating : sort === 'rating-desc' ? b.rating - a.rating : 0;
    return ratingDifference || a.nickname.localeCompare(b.nickname) || a.id.localeCompare(b.id);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.max(1, Math.min(page, pageCount));
  const start = (currentPage - 1) * 10;
  return { items: filtered.slice(start, start + 10), total: filtered.length, page: currentPage, pageCount, start };
}
