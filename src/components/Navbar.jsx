import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Crosshair, Menu, X } from 'lucide-react';

const links = [
  ['/', 'Home'], ['/matches', 'Matches'], ['/teams', 'Teams'],
  ['/free-agents', 'Free Agents'], ['/tournaments', 'Tournaments'],
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="navbar container">
        <Link className="brand" to="/" onClick={() => setIsOpen(false)}>
          <Crosshair aria-hidden="true" /><span>CS2 <strong>ARENA</strong></span>
        </Link>
        <button className="menu-toggle" type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
        <nav id="primary-navigation" aria-label="Main navigation" className={isOpen ? 'nav-links is-open' : 'nav-links'}>
          {links.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setIsOpen(false)}>{label}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
