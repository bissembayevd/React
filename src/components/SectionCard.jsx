import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionCard({ title, description, to, label = 'Explore' }) {
  return <article className="section-card"><span className="placeholder-label">COMING NEXT</span><h3>{title}</h3><p>{description}</p><Link className="text-link" to={to}>{label}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>;
}
