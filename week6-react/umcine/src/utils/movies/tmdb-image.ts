/** 포스터 경로를 TMDB 이미지 URL로 변환하고 경로가 없으면 null을 반환한다. */
export function getTmdbPosterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
}
/** 배경 이미지 경로를 TMDB 이미지 URL로 변환하고 경로가 없으면 null을 반환한다. */
export function getTmdbBackdropUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : null;
}
/** 상영 시간을 시간·분으로 표시하며 null과 0 이하 값은 정보 없음으로 처리한다. */
export function formatRuntime(runtime: number | null) {
  if (runtime === null || runtime <= 0) return '상영 시간 정보가 없어요.';
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours === 0 ? `${minutes}분` : `${hours}시간 ${minutes}분`;
}
