import { withoutEditionMarker } from '../utils/displayText';
import { Link } from 'react-router-dom';

import SafeImage from './SafeImage';

import DateLabel from './DateLabel';



export const formatPrize = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);



export default function TournamentCard({ tournament }) {

  return <li className="tournament-card"><Link to={`/tournaments/${tournament.id}`}><SafeImage src={tournament.image} fallback="/images/tournament-placeholder.svg" alt="" /><div className="tournament-card-body"><span className="competition-badge">{tournament.status}</span><h2>{withoutEditionMarker(tournament.name)}</h2><p>{tournament.location}</p><div className="tournament-dates"><DateLabel value={tournament.startDate} /><span> – </span><DateLabel value={tournament.endDate} /></div><p className="tournament-prize">{formatPrize(tournament.prizePool)} <span>USD</span></p><span className="directory-detail-link">View tournament →</span></div></Link></li>;

}

