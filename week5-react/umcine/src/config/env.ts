export const env = {
  tmdbApiBaseUrl: import.meta.env.VITE_TMDB_API_BASE_URL?.trim() ?? '',
  tmdbAccessToken: import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim() ?? '',
};

// 앱 전체가 흰 화면이 되지 않도록 실제 요청 시 검증한다.
export function requireTmdbEnv() {
  if (!env.tmdbApiBaseUrl || !env.tmdbAccessToken) {
    throw new Error('TMDB 환경 변수가 필요해요. .env.local 설정 후 개발 서버를 다시 시작해 주세요.');
  }
}
