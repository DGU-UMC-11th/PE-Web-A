import { isHTTPError } from 'ky';
import { TmdbEnvError } from '../../config/env';
export function getMovieErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TmdbEnvError) return 'TMDB 환경 변수가 필요해요. .env.local 설정 후 개발 서버를 다시 시작해 주세요.';
  if (isHTTPError(error) && error.response.status === 401) return 'TMDB 인증에 실패했어요. API Read Access Token을 확인해 주세요.';
  return fallback;
}
export function getMovieDetailErrorMessage(error: unknown) {
  if (isHTTPError(error) && error.response.status === 404) return '영화를 찾을 수 없어요.';
  return getMovieErrorMessage(error, '영화 정보를 불러오지 못했어요.');
}
