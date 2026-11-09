export function getTmdbPosterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
}
export function getTmdbBackdropUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : null;
}
export function formatRuntime(runtime: number | null) {
  if (runtime === null || runtime <= 0) return '상영 시간 정보가 없어요.';
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours === 0 ? `${minutes}분` : `${hours}시간 ${minutes}분`;
}
