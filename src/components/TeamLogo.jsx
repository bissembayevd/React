import { useState } from 'react';
import { teamLogoSources, teamInitials } from '../config/teamLogos';
import { publicAsset } from '../utils/publicAsset';

export default function TeamLogo({ team, className = '', loading = 'lazy' }) {
  const sources = teamLogoSources(team).map((path) => publicAsset(path));
  const key = JSON.stringify([team?.id, sources]);
  const [failure, setFailure] = useState({ key, index: 0 });
  const index = failure.key === key ? failure.index : 0;

  return <span className={`team-logo ${className}`.trim()} data-team-id={team?.id} aria-hidden="true">
    {index < sources.length
      ? <img key={`${key}:${index}`} src={sources[index]} alt="" loading={loading} decoding="async"
          onError={() => setFailure({ key, index: index + 1 })} />
      : <span className="team-logo-initials">{teamInitials(team?.name)}</span>}
  </span>;
}
