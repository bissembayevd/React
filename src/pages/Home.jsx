import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getNews, getMatches, getTeams, getTournaments } from '../services/api';
import { selectHomeData } from '../utils/homeData';
import HomeSection from '../components/HomeSection';
import NewsCard from '../components/NewsCard';
import MatchCard from '../components/MatchCard';
import TeamCard from '../components/TeamCard';
import '../styles/home.css';

function EmptyMessage({ children }) {
  return <p className="home-empty">{children}</p>;
}

export default function Home() {
  const [request, setRequest] = useState({ status: 'loading', data: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setRequest({ status: 'loading', data: null, error: '' });

    async function loadHome() {
      try {
        const [news, matches, teams, tournaments] = await Promise.all([
          getNews({ signal: controller.signal }), getMatches({ signal: controller.signal }), getTeams({ signal: controller.signal }), getTournaments({ signal: controller.signal }),
        ]);
        if (!cancelled) setRequest({ status: 'success', data: { news, matches, teams, tournaments }, error: '' });
      } catch (error) {
        if (!cancelled) setRequest({ status: 'error', data: null, error: error.message || 'Please try again.' });
      }
    }

    loadHome();
    // Ignore requests from unmounted components, previous retries, and StrictMode's first effect.
    return () => { cancelled = true; controller.abort(); };
  }, [attempt]);

  const home = request.data ? selectHomeData(request.data) : null;
  const renderMatch = (match) => (
    <MatchCard key={match.id} match={match} team1={home.teamsById.get(match.team1Id)} team2={home.teamsById.get(match.team2Id)} tournament={home.tournamentsById.get(match.tournamentId)} />
  );

  return (
    <div className="home-page">
      <header className="home-intro"><div><p className="eyebrow">THE COUNTER-STRIKE HUB</p><h1>Inside the arena.</h1></div><p>News. Competition. Community.</p></header>
      

      {request.status === 'loading' && <div className="home-feedback" role="status"><span className="eyebrow">CS2 ARENA</span><h2>Loading the arena…</h2><p>Getting news, matches, and teams.</p></div>}
      {request.status === 'error' && <div className="home-feedback" role="alert"><h2>Unable to load the homepage</h2><p>{request.error}</p><button type="button" className="button home-retry" onClick={() => setAttempt((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" /> Try again</button></div>}

      {home && (
        <div className="home-columns">
          <div className="home-news-column">
            <HomeSection id="featured-news" title="Featured news">
              {home.featuredArticle ? <NewsCard article={home.featuredArticle} featured /> : <EmptyMessage>No featured news is available yet.</EmptyMessage>}
            </HomeSection>
            <HomeSection id="latest-news" title="Latest news">
              {home.latestNews.length ? <div className="news-grid">{home.latestNews.map((article) => <NewsCard key={article.id} article={article} />)}</div> : <EmptyMessage>No more news is available yet.</EmptyMessage>}
            </HomeSection>
          </div>
          <aside className="home-sidebar" aria-label="Matches, results, and rankings">
            <HomeSection id="hot-matches" title="Hot upcoming matches" linkTo="/matches" linkLabel="View all matches">
              {home.upcomingMatches.length ? <div className="match-list">{home.upcomingMatches.map(renderMatch)}</div> : <EmptyMessage>No featured upcoming matches are scheduled.</EmptyMessage>}
            </HomeSection>
            <HomeSection id="recent-results" title="Recent results" linkTo="/matches#results" linkLabel="View all results">
              {home.recentResults.length ? <div className="match-list">{home.recentResults.map(renderMatch)}</div> : <EmptyMessage>No completed matches are available yet.</EmptyMessage>}
            </HomeSection>
            <HomeSection id="top-teams" title="Top teams" linkTo="/teams" linkLabel="All teams">
              <p className="ranking-caption">Top 5</p>
              {home.topTeams.length ? <ol className="team-rankings">{home.topTeams.map((team) => <TeamCard key={team.id} team={team} />)}</ol> : <EmptyMessage>No ranked teams are available yet.</EmptyMessage>}
            </HomeSection>
          </aside>
        </div>
      )}
    </div>
  );
}
