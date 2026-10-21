// Derived views only: all records are provided by the existing API.
export function selectHomeData({ news, matches, teams, tournaments }) {
  const sortedNews = [...news].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
  return {
    featuredArticle: sortedNews[0] ?? null,
    latestNews: sortedNews.slice(1, 7),
    upcomingMatches: matches.filter((match) => match.status === 'upcoming' && match.featured)
      .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime) || a.id.localeCompare(b.id)).slice(0, 4),
    recentResults: matches.filter((match) => match.status === 'completed')
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime) || a.id.localeCompare(b.id)).slice(0, 3),
    topTeams: [...teams].sort((a, b) => a.ranking - b.ranking || a.id.localeCompare(b.id)).slice(0, 5),
    teamsById: new Map(teams.map((team) => [team.id, team])),
    tournamentsById: new Map(tournaments.map((tournament) => [tournament.id, tournament])),
  };
}
