import { withoutEditionMarker } from '../utils/displayText';
import { Link } from 'react-router-dom';
import DateLabel from './DateLabel';
import TeamLogo from './TeamLogo';

export default function MatchCard({ match, team1, team2, tournament }) {
  const completed = match.status === 'completed';
  return (
    <article className="match-card">
      <Link to={completed ? '/matches#results' : '/matches'} className="match-card-link">
        <div className="match-meta"><span className={completed ? 'match-status completed' : 'match-status'}>{completed ? 'Completed' : 'Upcoming'}</span><span className="match-tournament">{withoutEditionMarker(tournament?.name ?? 'Tournament unavailable')}</span></div>
        {[team1, team2].map((team, index) => (
          <div className="match-team" key={index === 0 ? match.team1Id : match.team2Id}>
            <TeamLogo team={team} />
            <span>{team?.name ?? 'Team unavailable'}</span>
            {completed && <strong className={(index === 0 ? match.score1 > match.score2 : match.score2 > match.score1) ? 'winning-score' : ''}>{index === 0 ? match.score1 : match.score2}</strong>}
          </div>
        ))}
        <div className="match-date"><DateLabel value={match.startTime} includeTime={!completed} /></div>
      </Link>
    </article>
  );
}
