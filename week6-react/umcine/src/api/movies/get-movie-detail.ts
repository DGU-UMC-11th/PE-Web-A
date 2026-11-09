import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieDetail } from './models';
export type GetMovieDetailResponse = TmdbMovieDetail;
/** 영화 ID로 한국어 상세 정보를 조회하며 요청 취소 신호를 전달한다. */
export function getMovieDetail(movieId: number, signal?: AbortSignal) {
  return tmdbClient.get(`movie/${movieId}`, { searchParams: { language: 'ko-KR' }, signal }).json<GetMovieDetailResponse>();
}
