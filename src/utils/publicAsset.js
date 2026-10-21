export function publicAsset(path, base = import.meta.env?.BASE_URL ?? '/') {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith(base)) return path;
  return base + path.slice(1);
}
