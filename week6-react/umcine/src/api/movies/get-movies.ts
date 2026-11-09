import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieListResponse } from './models';
export interface GetMoviesRequest { page?: number; signal?: AbortSignal }
export type GetMoviesResponse = TmdbMovieListResponse;
/** 지정한 페이지의 인기 영화 목록을 조회한다. 페이지 기본값은 1이다. */
export function getMovies({ page = 1, signal }: GetMoviesRequest = {}) {
  return tmdbClient.get('movie/popular', { searchParams: { language: 'ko-KR', page }, signal }).json<GetMoviesResponse>();
}
