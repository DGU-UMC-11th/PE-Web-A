export function getTmdbEnv() {
  const tmdbApiBaseUrl = import.meta.env.VITE_TMDB_API_BASE_URL?.trim();
  const tmdbAccessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();
  if (!tmdbApiBaseUrl || !tmdbAccessToken) {
    throw new Error("TMDB 환경 변수가 필요해요. .env.local을 설정하고 개발 서버를 다시 시작해 주세요.");
  }
  return { tmdbApiBaseUrl: tmdbApiBaseUrl.replace(/\/+$/, ""), tmdbAccessToken };
}
