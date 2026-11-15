export function getTmdbPosterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
}
export function getTmdbBackdropUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : null;
}
