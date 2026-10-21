import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import TeamLogo from './TeamLogo';

export default function TeamRankingRow({ team }) {
  return (
    <li className="team-directory-row">
      <span className="directory-rank"><span className="mobile-field-label">Ranking </span>#{team.ranking}</span>
      <Link className="directory-team-name" to={`/teams/${team.id}`}><TeamLogo team={team} /><h2>{team.name}</h2></Link>
      <span className="directory-country"><span className="mobile-field-label">Country </span>{team.country}</span>
      <span className="directory-player-count"><span className="mobile-field-label">Players </span>{team.playerIds.length}</span>
      <Link className="directory-detail-link" to={`/teams/${team.id}`} aria-label={`View details for ${team.name}`}>View details <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </li>
  );
}
