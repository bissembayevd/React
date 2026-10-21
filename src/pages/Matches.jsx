import { withoutEditionMarker } from '../utils/displayText';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMatches, getTeams, getTournaments } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/PageHeader';
import RequestState from '../components/RequestState';
import Pagination from '../components/Pagination';
import MatchRow from '../components/MatchRow';
import { selectMatches } from '../utils/competitionDirectory';
import '../styles/teams.css';
import '../styles/competitions.css';

async function loadMatches(options) {
  const [matches, teams, tournaments] = await Promise.all([getMatches(options), getTeams(options), getTournaments(options)]);
  return { matches, teams, tournaments };
}

export default function Matches() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(location.hash === '#results' ? 'results' : 'upcoming');
  const [controls, setControls] = useState({ tournament: '', page: 1 });
  const { status, data, error, retry } = useApiResource(loadMatches);
  useEffect(() => {
    // Other anchors (such as the layout's skip-to-content link) must not change tabs.
    if (location.hash !== '' && location.hash !== '#results') return;
    setTab(location.hash === '#results' ? 'results' : 'upcoming');
    setControls((previous) => ({ ...previous, page: 1 }));
  }, [location.hash]);
  function change(field, value) { setControls((previous) => ({ ...previous, [field]: value, page: 1 })); }
  function reset() { setControls({ tournament: '', page: 1 }); }
  const results = selectMatches(data?.matches ?? [], { ...controls, tab, sort: tab === 'results' ? 'date-desc' : 'date-asc' });
  return <div><PageHeader title="Every round matters." description="Explore upcoming fixtures and completed results." />
    <div className="competition-tabs" role="group" aria-label="Match status">{['upcoming', 'results'].map((value) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => { setTab(value); change('page', 1); navigate(value === 'results' ? '/matches#results' : '/matches'); }}>{value === 'results' ? 'Results' : 'Upcoming'}</button>)}</div>
    {status === 'loading' && <RequestState title="Loading matches…" message="Getting fixtures, teams, and tournaments." />}
    {status === 'error' && <RequestState error title="Unable to load matches" message={error?.message} onRetry={retry} />}
    {status === 'success' && <><div className="directory-controls competition-controls"><label><span>Tournament</span><select value={controls.tournament} onChange={(event) => change('tournament', event.target.value)}><option value="">All tournaments</option>{data.tournaments.map((item) => <option key={item.id} value={item.id}>{withoutEditionMarker(item.name)}</option>)}</select></label><button className="directory-reset" type="button" onClick={reset}>Reset filters</button></div>
      <p className="directory-summary" role="status">{results.total ? `Showing ${results.start + 1}–${results.start + results.items.length} of ${results.total} ${tab === 'results' ? 'results' : 'upcoming matches'} · Page ${results.page} of ${results.pageCount}` : '0 matches found'}</p>
      <section id={tab === 'results' ? 'results' : 'upcoming'} aria-label={tab === 'results' ? 'Completed results' : 'Upcoming matches'}>{results.total ? <div className="competition-match-list">{results.items.map((match) => <MatchRow key={match.id} match={match} teams={data.teams} tournaments={data.tournaments} />)}</div> : <RequestState title="No matches found" message="Try another tournament, or reset the filters." />}</section>
      <Pagination label="Matches pagination" page={results.page} pageCount={results.pageCount} onPageChange={(page) => setControls((previous) => ({ ...previous, page }))} />
    </>}
  </div>;
}
