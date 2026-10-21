import { teamOverviewText } from '../utils/displayText';
import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeamById, getPlayers } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import RequestState from '../components/RequestState';
import TeamLogo from '../components/TeamLogo';
import RosterPlayerCard from '../components/RosterPlayerCard';
import { getTeamRoster } from '../utils/teamDirectory';
import '../styles/teams.css';

export default function TeamDetails() {
  const { teamId } = useParams();
  // A keyed child resets the request immediately when the route ID changes.
  return <TeamProfile key={teamId} teamId={teamId} />;
}

function TeamProfile({ teamId }) {
  const load = useCallback(async (options) => {
    const [team, players] = await Promise.all([getTeamById(teamId, options), getPlayers(options)]);
    return { team, players };
  }, [teamId]);
  const { status, data, error, retry } = useApiResource(load);
  const roster = data ? getTeamRoster(data.team, data.players) : [];
  const overview = data ? teamOverviewText(data.team.description) : '';
  const missing = error?.code === 'NOT_FOUND' || error?.code === 'INVALID_ID';
  return (
    <div className="team-details-page">
      <Link className="back-link" to="/teams">← All teams</Link>
      {status === 'loading' && <RequestState title="Loading team…" message="Getting the team profile and complete roster." />}
      {status === 'error' && <RequestState error title={missing ? 'Team not found' : 'Unable to load team'} message={missing ? 'This team ID is not in the directory. Choose a team from the directory.' : error?.message || 'Please try again.'} onRetry={missing ? undefined : retry} />}
      {status === 'success' && <>
        <header className="team-profile-header">
          <TeamLogo className="team-profile-logo" team={data.team} loading="eager" />
          <div><p className="eyebrow">TEAM PROFILE</p><h1>{data.team.name}</h1><p className="team-profile-country">{data.team.country}</p></div>
          <div className="team-profile-ranking"><span>Ranking</span><strong>#{data.team.ranking}</strong></div>
        </header>
        
        {overview && <section className="team-description" aria-labelledby="team-overview"><h2 id="team-overview">Team overview</h2><p>{overview}</p></section>}
        <section aria-labelledby="team-roster"><div className="roster-section-heading"><h2 id="team-roster">Player roster</h2><span>{roster.length} {roster.length === 1 ? 'player' : 'players'}</span></div>
          {roster.length ? <ul className="team-roster">{roster.map((player) => <RosterPlayerCard key={player.id} player={player} />)}</ul> : <RequestState title="No players on this roster" message="No players are currently assigned to this team." />}
        </section>
      </>}
    </div>
  );
}
