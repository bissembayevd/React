import { useState } from 'react';
import { imageCandidates } from '../utils/imageSources';
import { publicAsset } from '../utils/publicAsset';

export default function SafeImage({ src, fallback, alt, className, loading = 'lazy' }) {
  const key = `${src}|${fallback}`;
  const [failure, setFailure] = useState({ key, index: 0 });
  const candidates = imageCandidates(src, fallback).map((path) => publicAsset(path));
  const index = failure.key === key ? Math.min(failure.index, candidates.length - 1) : 0;
  const teamLogo = fallback === '/images/team-placeholder.svg';
  return <img className={['safe-image', teamLogo ? 'team-logo' : '', className].filter(Boolean).join(' ')} src={candidates[index]} alt={alt} loading={loading} decoding="async" data-image-fallback={index > 0 ? 'true' : undefined} onError={() => {
    if (index < candidates.length - 1) setFailure({ key, index: index + 1 });
  }} />;
}
