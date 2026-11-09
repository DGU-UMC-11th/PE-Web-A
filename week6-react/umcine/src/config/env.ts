export const env = {
  tmdbApiBaseUrl: import.meta.env.VITE_TMDB_API_BASE_URL?.trim() ?? '',
  tmdbAccessToken: import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim() ?? '',
};

export class TmdbEnvError extends Error {}

/** 실제 요청 직전에 환경 설정을 검사하고 누락되면 전용 오류를 발생시킨다. */
export function requireTmdbEnv() {
  if (!env.tmdbApiBaseUrl || !env.tmdbAccessToken) {
    throw new TmdbEnvError('TMDB 환경 변수가 필요해요. .env.local 설정 후 개발 서버를 다시 시작해 주세요.');
  }
}
