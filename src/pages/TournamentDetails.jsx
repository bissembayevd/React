import { withoutEditionMarker } from '../utils/displayText';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTournamentById, getMatches, getTeams } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import RequestState from '../components/RequestState';
import MatchRow from '../components/MatchRow';
import PageHeader from '../components/PageHeader';
import DateLabel from '../components/DateLabel';
import SafeImage from '../components/SafeImage';
import { formatPrize } from '../components/TournamentCard';
import { relatedMatches } from '../utils/competitionDirectory';
import '../styles/teams.css';
import '../styles/competitions.css';

export default function TournamentDetails() {
  const { tournamentId } = useParams();
  return <TournamentProfile key={tournamentId} tournamentId={tournamentId} />;
}

function TournamentProfile({ tournamentId }) {
  const load = useCallback(async (options) => {
    const [tournament, matches, teams] = await Promise.all([getTournamentById(tournamentId, options), getMatches(options), getTeams(options)]);
    return { tournament, matches, teams };
  }, [tournamentId]);
  const { status, data, error, retry } = useApiResource(load);
  const missing = error?.code === 'NOT_FOUND' || error?.code === 'INVALID_ID';
  const matches = data ? relatedMatches(data.matches, data.tournament.id) : [];
  return <div><Link className="back-link" to="/tournaments">← All tournaments</Link>
    {status === 'loading' && <RequestState title="Loading tournament…" />}
    {status === 'error' && <RequestState error title={missing ? 'Tournament not found' : 'Unable to load tournament'} message={error?.message} onRetry={missing ? undefined : retry} />}
    {status === 'success' && <><PageHeader eyebrow="TOURNAMENT DETAILS" title={withoutEditionMarker(data.tournament.name)} description={data.tournament.location} /><div className="tournament-profile"><SafeImage src={data.tournament.image} fallback="/images/tournament-placeholder.svg" alt="" loading="eager" /><dl><div><dt>Status</dt><dd><span className="competition-badge">{data.tournament.status}</span></dd></div><div><dt>Start date</dt><dd><DateLabel value={data.tournament.startDate} /></dd></div><div><dt>End date</dt><dd><DateLabel value={data.tournament.endDate} /></dd></div><div><dt>Prize pool (USD)</dt><dd>{formatPrize(data.tournament.prizePool)}</dd></div></dl></div><section aria-labelledby="tournament-matches"><div className="roster-section-heading"><h2 id="tournament-matches">Related matches</h2><span>{matches.length} matches</span></div>{matches.length ? <div className="competition-match-list">{matches.map((match) => <MatchRow key={match.id} match={match} teams={data.teams} tournaments={[data.tournament]} />)}</div> : <RequestState title="No matches scheduled" message="This tournament has no related fixtures yet." />}</section></>}
  </div>;
}
