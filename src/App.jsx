import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Matches from './pages/Matches';
import PlaceholderPage from './pages/PlaceholderPage';
import TeamDetails from './pages/TeamDetails';
import Teams from './pages/Teams';
import PlayerDetails from './pages/PlayerDetails';
import NewsDetails from './pages/NewsDetails';
import FreeAgents from './pages/FreeAgents';
import AddPlayer from './pages/AddPlayer';
import MatchDetails from './pages/MatchDetails';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:matchId" element={<MatchDetails />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:teamId" element={<TeamDetails />} />
        <Route path="free-agents" element={<FreeAgents />} />
        <Route path="players/:playerId" element={<PlayerDetails />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/:tournamentId" element={<TournamentDetails />} />
        <Route path="news/:newsId" element={<NewsDetails />} />
        <Route path="add-player" element={<AddPlayer />} />
        <Route path="*" element={<PlaceholderPage title="Page not found." description="This route is outside the arena. Use the navigation to get back to the action." panelTitle="404" panelDescription="The requested page does not exist." />} />
      </Route>
    </Routes>
  );
}
