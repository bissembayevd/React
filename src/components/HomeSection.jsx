import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeSection({ id, title, linkTo, linkLabel, children }) {
  return (
    <section className="home-section" aria-labelledby={id}>
      <div className="home-section-heading">
        <h2 id={id}>{title}</h2>
        {linkTo && <Link className="text-link" to={linkTo}>{linkLabel}<ArrowUpRight size={14} aria-hidden="true" /></Link>}
      </div>
      {children}
    </section>
  );
}
