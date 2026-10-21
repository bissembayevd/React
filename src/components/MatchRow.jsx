import { withoutEditionMarker } from '../utils/displayText';
import { Link } from 'react-router-dom';
import DateLabel from './DateLabel';
import TeamLogo from './TeamLogo';

export default function MatchRow({ match, teams, tournaments, showDetailsLink = true }) {
  const completed = match.status === 'completed';
  const tournament = tournaments.find((item) => item.id === match.tournamentId);
  return <article className="competition-match-row">
    <div className="competition-match-meta"><span className={`competition-badge ${completed ? 'muted-badge' : ''}`}>{completed ? 'Completed' : 'Upcoming'}</span>{match.featured && <span className="featured-badge">Featured</span>}<Link to={`/tournaments/${match.tournamentId}`}>{withoutEditionMarker(tournament?.name ?? 'Tournament unavailable')}</Link></div>
    <div className="competition-match-main"><div className="competition-opponents">{[match.team1Id, match.team2Id].map((id, index) => {
      const team = teams.find((item) => item.id === id);
      const score = index === 0 ? match.score1 : match.score2;
      const winner = completed && score > (index === 0 ? match.score2 : match.score1);
      return <div key={id} className={`competition-team ${winner ? 'competition-winner' : ''}`}><Link to={`/teams/${id}`}><TeamLogo team={team} /><span>{team?.name ?? 'Team unavailable'}</span></Link>{completed && <strong aria-label={`${score} maps${winner ? ', winner' : ''}`}>{score}{winner && <small>WIN</small>}</strong>}</div>;
    })}</div><div className="competition-match-date"><span>{completed ? 'Recorded match date' : 'Scheduled'}</span><DateLabel value={match.startTime} includeTime={!completed} />{showDetailsLink && <Link className="directory-detail-link" to={`/matches/${match.id}`}>Match details →</Link>}</div></div>
  </article>;
}
