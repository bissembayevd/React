import { useState } from 'react';
import { getTournaments } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/PageHeader';
import RequestState from '../components/RequestState';
import Pagination from '../components/Pagination';
import TournamentCard from '../components/TournamentCard';
import { selectTournaments } from '../utils/competitionDirectory';
import '../styles/teams.css';
import '../styles/competitions.css';

export default function Tournaments() {
  const { status, data, error, retry } = useApiResource(getTournaments);
  const [controls, setControls] = useState({ status: '', page: 1 });
  function change(field, value) { setControls((previous) => ({ ...previous, [field]: value, page: 1 })); }
  function reset() { setControls({ status: '', page: 1 }); }
  const results = selectTournaments(data ?? [], controls);
  const statuses = [...new Set((data ?? []).map((item) => item.status))].sort();
  return <div><PageHeader title="The biggest stages." description="Explore the events in the CS2 ARENA circuit." />
    {status === 'loading' && <RequestState title="Loading tournaments…" />}
    {status === 'error' && <RequestState error title="Unable to load tournaments" message={error?.message} onRetry={retry} />}
    {status === 'success' && <><div className="directory-controls competition-controls"><label><span>Status</span><select value={controls.status} onChange={(event) => change('status', event.target.value)}><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button className="directory-reset" type="button" onClick={reset}>Reset filters</button></div><p className="directory-summary" role="status">{results.total ? `Showing ${results.start + 1}–${results.start + results.items.length} of ${results.total} tournaments · Page ${results.page} of ${results.pageCount}` : '0 tournaments found'}</p>{results.total ? <ul className="tournament-grid">{results.items.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}</ul> : <RequestState title="No tournaments found" message="Try another status, or reset the filters." />}<Pagination label="Tournaments pagination" page={results.page} pageCount={results.pageCount} onPageChange={(page) => setControls((previous) => ({ ...previous, page }))} /></>}
  </div>;
}
