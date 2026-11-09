import { isHTTPError } from 'ky';
import { TmdbEnvError } from '../../config/env';
/** 환경 설정 및 인증 오류를 구분하고 그 외 오류에는 기본 안내를 반환한다. */
export function getMovieErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TmdbEnvError) return 'TMDB 환경 변수가 필요해요. .env.local 설정 후 개발 서버를 다시 시작해 주세요.';
  if (isHTTPError(error) && error.response.status === 401) return 'TMDB 인증에 실패했어요. API Read Access Token을 확인해 주세요.';
  return fallback;
}
/** 상세 조회의 404 오류를 영화 없음 안내로 변환한다. */
export function getMovieDetailErrorMessage(error: unknown) {
  if (isHTTPError(error) && error.response.status === 404) return '영화를 찾을 수 없어요.';
  return getMovieErrorMessage(error, '영화 정보를 불러오지 못했어요.');
}
