import { useState } from 'react';
import { Search } from 'lucide-react';
import { getTeams } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/PageHeader';
import RequestState from '../components/RequestState';
import Pagination from '../components/Pagination';
import TeamRankingRow from '../components/TeamRankingRow';
import { getTeamCountries, selectTeams } from '../utils/teamDirectory';
import '../styles/teams.css';

export default function Teams() {
  const { status, data: teams, error, retry } = useApiResource(getTeams);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const countries = getTeamCountries(teams ?? []);
  const results = selectTeams(teams ?? [], { search, country, page });

  function resetControls() {
    setSearch(''); setCountry(''); setPage(1);
  }

  return (
    <div className="teams-page">
      <PageHeader eyebrow="THE COMPETITIVE LANDSCAPE" title="Team rankings." description="Explore the teams, compare rankings, and meet the players behind each name." />
      
      {status === 'loading' && <RequestState title="Loading teams…" message="Getting team rankings and rosters." />}
      {status === 'error' && <RequestState error title="Unable to load teams" message={error?.message || 'Please try again.'} onRetry={retry} />}
      {status === 'success' && <>
        <div className="directory-controls">
          <label className="team-search"><span>Search teams</span><div><Search size={17} aria-hidden="true" /><input type="search" value={search} placeholder="Search by team name…" onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div></label>
          <label><span>Country / region</span><select value={country} onChange={(event) => { setCountry(event.target.value); setPage(1); }}><option value="">All countries / regions</option>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button className="directory-reset" type="button" onClick={resetControls}>Reset</button>
        </div>
        <p className="directory-summary" role="status">{results.total ? `Showing ${results.start + 1}–${results.start + results.items.length} of ${results.total} teams · Page ${results.page} of ${results.pageCount}` : '0 teams found'}</p>
        {results.total ? <>
          <div className="directory-column-labels" aria-hidden="true"><span>Rank</span><span>Team</span><span>Country / region</span><span>Players</span><span>Profile</span></div>
          <ol className="team-directory" aria-label="Team rankings">{results.items.map((team) => <TeamRankingRow key={team.id} team={team} />)}</ol>
          <Pagination page={results.page} pageCount={results.pageCount} onPageChange={setPage} />
        </> : <RequestState title={teams.length ? 'No teams match your search' : 'No teams available'} message={teams.length ? 'Try another name or country, or reset your filters.' : 'The directory is currently empty.'} onRetry={teams.length ? resetControls : undefined} actionLabel="Reset filters" />}
      </>}
    </div>
  );
}
