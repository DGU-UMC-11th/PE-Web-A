export function getTmdbPosterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
}
export function getTmdbBackdropUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : null;
}
export function formatRuntime(runtime: number | null) {
  return runtime === null ? '상영 시간 정보가 없어요.' : `${Math.floor(runtime / 60)}시간 ${runtime % 60}분`;
}
