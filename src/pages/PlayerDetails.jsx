import { useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getPlayerById, getTeamById } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import RequestState from '../components/RequestState';
import SafeImage from '../components/SafeImage';
import TeamLogo from '../components/TeamLogo';
import '../styles/teams.css';
import '../styles/players.css';

export default function PlayerDetails() {
  const { playerId } = useParams();
  return <PlayerProfile key={playerId} playerId={playerId} />;
}

function PlayerProfile({ playerId }) {
  const location = useLocation();
  const load = useCallback(async (options) => {
    const player = await getPlayerById(playerId, options);
    const team = player.status === 'active' && player.teamId ? await getTeamById(player.teamId, options) : null;
    return { player, team };
  }, [playerId]);
  const { status, data, error, retry } = useApiResource(load);
  const missing = error?.code === 'NOT_FOUND' || error?.code === 'INVALID_ID';
  return <div className="player-details-page"><Link className="back-link" to="/free-agents">← All free agents</Link>
    {location.state?.playerCreated === playerId && <p role="status" className="form-feedback form-success">Player created successfully and saved to the database.</p>}
    {status === 'loading' && <RequestState title="Loading player…" message="Getting the player profile." />}
    {status === 'error' && <RequestState error title={missing ? 'Player not found' : 'Unable to load player'} message={missing ? 'This player ID is not in the directory.' : error?.message || 'Please try again.'} onRetry={missing ? undefined : retry} />}
    {status === 'success' && <>
      <header className="player-profile-header"><SafeImage src={data.player.status === 'free-agent' ? '/images/player-placeholder.svg' : data.player.image} fallback="/images/player-placeholder.svg" alt="" loading="eager" /><div><p className="eyebrow">PLAYER PROFILE</p><h1>{data.player.nickname}</h1><p>{data.player.firstName} {data.player.lastName}</p><span className="player-status-badge">{data.player.status === 'free-agent' && data.player.teamId === null ? 'Free agent · Available' : 'Active player'}</span></div></header>
      
      <section className="player-profile-information" aria-labelledby="player-information"><h2 id="player-information">Player information</h2><dl className="player-facts">{[['Nationality', data.player.nationality], ['Age', `${data.player.age} years`], ['Role', data.player.provenance && !data.player.provenance.roleVerified ? 'Unverified' : data.player.role], ['Rating', data.player.rating.toFixed(2)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className="player-team-section" aria-labelledby="player-team"><h2 id="player-team">{data.team ? (data.player.provenance ? 'Team at roster snapshot' : 'Team') : 'Availability'}</h2>{data.team ? <Link className="player-team-link" to={`/teams/${data.team.id}`}><TeamLogo team={data.team} /><span>{data.team.name}<small>{data.team.country} · Rank #{data.team.ranking}</small></span><span className="directory-detail-link">View team →</span></Link> : <p>Available as a free agent. This player is not attached to a team.</p>}</section>
    </>}
  </div>;
}
