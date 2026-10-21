import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { publicAsset } from '../utils/publicAsset';

export default function Layout() {
  const location = useLocation();
  return (
    <>
      <Link className="skip-link" to={{ pathname: location.pathname, search: location.search, hash: '#main-content' }}>Skip to content</Link>
      <Navbar />
      <main id="main-content" className="container main-content"><Outlet /></main>
      <footer className="site-footer container"><span>CS2 ARENA</span><a href={publicAsset('/asset-credits.html')}>Artwork &amp; logo credits</a><p>Independent Counter-Strike 2 community portal.</p></footer>
    </>
  );
}
