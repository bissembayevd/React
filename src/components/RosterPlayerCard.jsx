import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SafeImage from './SafeImage';

export default function RosterPlayerCard({ player }) {
  return (
    <li className="roster-player-card">
      <Link to={`/players/${player.id}`}>
        <SafeImage src={player.image} fallback="/images/player-placeholder.svg" alt="" />
        <div className="roster-player-body"><div className="roster-player-heading"><h3>{player.nickname}</h3><ArrowUpRight size={16} aria-hidden="true" /></div>
          <p>{player.nationality}</p>
          <dl><div><dt>Role</dt><dd>{player.provenance && !player.provenance.roleVerified ? 'Unverified' : player.role}</dd></div><div><dt>Rating</dt><dd className="roster-rating">{player.rating.toFixed(2)}</dd></div></dl>
        </div>
      </Link>
    </li>
  );
}
