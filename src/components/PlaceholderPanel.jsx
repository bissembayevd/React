import { Crosshair } from 'lucide-react';

export default function PlaceholderPanel({ title, description }) {
  return <section className="placeholder-panel"><div className="panel-icon"><Crosshair size={28} aria-hidden="true" /></div><span className="placeholder-label">PHASE 1 PREVIEW</span><h2>{title}</h2><p>{description}</p></section>;
}
