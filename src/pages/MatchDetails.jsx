import { withoutEditionMarker } from '../utils/displayText';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMatchById, getTeamById, getTournamentById } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import RequestState from '../components/RequestState';
import MatchRow from '../components/MatchRow';
import PageHeader from '../components/PageHeader';
import DateLabel from '../components/DateLabel';
import '../styles/teams.css';
import '../styles/competitions.css';

export default function MatchDetails() {
  const { matchId } = useParams();
  return <MatchProfile key={matchId} matchId={matchId} />;
}

function MatchProfile({ matchId }) {
  const load = useCallback(async (options) => {
    const match = await getMatchById(matchId, options);
    const [team1, team2, tournament] = await Promise.all([getTeamById(match.team1Id, options), getTeamById(match.team2Id, options), getTournamentById(match.tournamentId, options)]);
    return { match, teams: [team1, team2], tournament };
  }, [matchId]);
  const { status, data, error, retry } = useApiResource(load);
  const missing = error?.code === 'NOT_FOUND' || error?.code === 'INVALID_ID';
  return <div><Link className="back-link" to={data?.match.status === 'completed' ? '/matches#results' : '/matches'}>← All matches</Link>
    {status === 'loading' && <RequestState title="Loading match…" />}
    {status === 'error' && <RequestState error title={missing ? 'Match not found' : 'Unable to load match'} message={error?.message} onRetry={missing ? undefined : retry} />}
    {status === 'success' && <><PageHeader eyebrow="MATCH DETAILS" title={`${data.teams[0].name} vs ${data.teams[1].name}`} description="CS2 ARENA fixture." /><MatchRow showDetailsLink={false} match={data.match} teams={data.teams} tournaments={[data.tournament]} /><div className="competition-detail-panel"><h2>Scheduled date</h2><p><DateLabel value={data.match.startTime} includeTime /></p><h2>Tournament</h2><Link className="directory-detail-link" to={`/tournaments/${data.tournament.id}`}>{withoutEditionMarker(data.tournament.name)} →</Link></div></>}
  </div>;
}
