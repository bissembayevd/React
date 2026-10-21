// A final inline fallback also works when both local files are unavailable.
export const EMERGENCY_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect x="1" y="1" width="158" height="158" rx="6" fill="#101214" stroke="#292d31"/><text x="80" y="105" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" fill="#8c949b">?</text></svg>');

export function imageCandidates(src, fallback) {
  return [...new Set([src, ...(Array.isArray(fallback) ? fallback : [fallback]), EMERGENCY_IMAGE].filter(Boolean))];
}
