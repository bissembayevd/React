import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TeamLogo from './TeamLogo';

export default function TeamCard({ team }) {
  return (
    <li className="ranked-team">
      <Link to={`/teams/${team.id}`}>
        <span className="team-rank">#{team.ranking}</span>
        <TeamLogo team={team} />
        <div className="team-card-info"><h3>{team.name}</h3><p>{team.country}</p></div>
        <ChevronRight size={15} aria-hidden="true" />
      </Link>
    </li>
  );
}
