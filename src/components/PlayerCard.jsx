import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SafeImage from './SafeImage';

export default function PlayerCard({ player }) {
  return <li className="agent-card"><SafeImage src="/images/player-placeholder.svg" fallback="/images/player-placeholder.svg" alt="" /><div className="agent-card-body"><span className="player-status-badge">Free agent</span><h2>{player.nickname}</h2><p>{player.nationality} · {player.age} years old</p><dl><div><dt>Role</dt><dd>{player.role}</dd></div><div><dt>Rating</dt><dd className="player-rating">{player.rating.toFixed(2)}</dd></div></dl><Link className="directory-detail-link" to={`/players/${player.id}`} aria-label={`View profile for ${player.nickname}`}>View profile <ArrowUpRight size={15} aria-hidden="true" /></Link></div></li>;
}
