export default function PageHeader({ eyebrow = 'THE COUNTER-STRIKE HUB', title, description }) {
  return <div className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>;
}
