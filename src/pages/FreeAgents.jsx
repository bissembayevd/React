import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlayers, PLAYER_ROLES } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/PageHeader';
import RequestState from '../components/RequestState';
import Pagination from '../components/Pagination';
import PlayerCard from '../components/PlayerCard';
import { getPlayerCountries, selectFreeAgents } from '../utils/playerDirectory';
import '../styles/teams.css';
import '../styles/players.css';

export default function FreeAgents() {
  const { status, data: players, error, retry } = useApiResource(getPlayers);
  const [controls, setControls] = useState({ search: '', country: '', role: '', sort: 'rating-desc', page: 1 });
  const results = selectFreeAgents(players ?? [], controls);
  const countries = getPlayerCountries(players ?? []);
  function change(field, value) { setControls((previous) => ({ ...previous, [field]: value, page: 1 })); }
  function reset() { setControls({ search: '', country: '', role: '', sort: 'rating-desc', page: 1 }); }
  return <div className="players-page">
    <div className="players-page-heading"><PageHeader eyebrow="THE NEXT CHAPTER" title="Free agents." description="Discover unattached talent and explore their player profiles." /><Link className="button" to="/add-player">Add player</Link></div>
    
    {status === 'loading' && <RequestState title="Loading free agents…" message="Finding available players." />}
    {status === 'error' && <RequestState error title="Unable to load free agents" message={error?.message || 'Please try again.'} onRetry={retry} />}
    {status === 'success' && <>
      <div className="directory-controls agent-controls">
        <label><span>Search nickname</span><input type="search" placeholder="Search by nickname…" value={controls.search} onChange={(event) => change('search', event.target.value)} /></label>
        <label><span>Nationality</span><select value={controls.country} onChange={(event) => change('country', event.target.value)}><option value="">All countries</option>{countries.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label><span>Role</span><select value={controls.role} onChange={(event) => change('role', event.target.value)}><option value="">All roles</option>{PLAYER_ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
        <label><span>Sort by</span><select value={controls.sort} onChange={(event) => change('sort', event.target.value)}><option value="rating-desc">Rating (highest first)</option><option value="rating-asc">Rating (lowest first)</option><option value="nickname">Nickname (A–Z)</option></select></label>
        <button type="button" className="directory-reset" onClick={reset}>Reset filters</button>
      </div>
      <p className="directory-summary" role="status">{results.total ? `Showing ${results.start + 1}–${results.start + results.items.length} of ${results.total} free agents · Page ${results.page} of ${results.pageCount}` : '0 free agents found'}</p>
      {results.total ? <><ul className="agent-grid">{results.items.map((player) => <PlayerCard key={player.id} player={player} />)}</ul><Pagination label="Free agents pagination" page={results.page} pageCount={results.pageCount} onPageChange={(page) => setControls((previous) => ({ ...previous, page }))} /></> : <RequestState title="No free agents found" message="Try different filters or add a new player." onRetry={reset} actionLabel="Reset filters" />}
    </>}
  </div>;
}
