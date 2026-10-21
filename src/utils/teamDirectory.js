export const TEAMS_PER_PAGE = 10;

export function getTeamCountries(teams) {
  return [...new Set(teams.map((team) => team.country))].sort((a, b) => a.localeCompare(b));
}

export function selectTeams(teams, { search = '', country = '', sort = 'ranking', page = 1 } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = teams.filter((team) => team.name.toLowerCase().includes(query) && (!country || team.country === country));
  filtered.sort((a, b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
    if (sort === 'name-desc') return b.name.localeCompare(a.name) || a.id.localeCompare(b.id);
    return a.ranking - b.ranking || a.id.localeCompare(b.id);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / TEAMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * TEAMS_PER_PAGE;
  return { items: filtered.slice(start, start + TEAMS_PER_PAGE), total: filtered.length, pageCount, page: currentPage, start };
}

export function getTeamRoster(team, players) {
  const byId = new Map(players.map((player) => [player.id, player]));
  return team.playerIds.map((id) => byId.get(id)).filter((player) => player && player.teamId === team.id);
}
