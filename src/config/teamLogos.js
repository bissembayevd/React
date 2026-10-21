export const TEAM_LOGOS = {
  'team-01': 'navi.svg',
  'team-02': 'vitality.webp',
  'team-03': 'faze.svg',
  'team-04': 'g2.png',
  'team-05': 'spirit.svg',
  'team-06': 'mouz.svg',
  'team-07': 'astralis.svg',
  'team-08': 'liquid.svg',
  'team-09': 'furia.svg',
  'team-10': 'virtus pro.svg',
  'team-11': 'nip.png',
  'team-12': 'complexity.webp',
  'team-13': 'big.svg',
  'team-14': 'ence.svg',
  'team-15': 'heroic.webp',
  'team-16': 'falcons.webp',
  'team-17': 'gamer legion.webp',
  'team-18': 'pain.svg',
  'team-19': 'imperial.png',
  'team-20': '9z.webp',
  'team-21': 'the mongolz.png',
  'team-22': 'flyquest.svg',
  'team-23': 'tyloo.svg',
  'team-24': 'betboom.png',
};

export function teamLogoSources(team, filenames = TEAM_LOGOS) {
  const filename = filenames[team?.id]?.trim();
  const apiLogo = team?.logo;
  // Existing generic white initials images are placeholders, not team logos.
  const generic = !apiLogo || /\/(?:team-placeholder\.svg|teams\/neutral-team-[^/]+\.svg)(?:[?#].*)?$/.test(apiLogo);
  return [...new Set([
    filename ? `/images/teams/${encodeURIComponent(filename)}` : null,
    generic ? null : apiLogo,
  ].filter(Boolean))];
}

export function teamInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words.map((word) => word[0]).join('').slice(0, 3) : words[0]?.slice(0, 3))?.toUpperCase() || '?';
}
