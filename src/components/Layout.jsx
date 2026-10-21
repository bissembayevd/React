import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="container main-content"><Outlet /></main>
      <footer className="site-footer container"><span>CS2 ARENA</span><a href="/asset-credits.html">Artwork &amp; logo credits</a><p>Independent Counter-Strike 2 community portal.</p></footer>
    </>
  );
}
