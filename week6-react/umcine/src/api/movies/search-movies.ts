import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieListResponse } from './models';
export interface SearchMoviesRequest { query: string; page?: number; signal?: AbortSignal }
export type SearchMoviesResponse = TmdbMovieListResponse;
/** 검색어와 페이지로 성인 콘텐츠를 제외한 한국어 영화 목록을 조회한다. */
export function searchMovies({ query, page = 1, signal }: SearchMoviesRequest) {
  return tmdbClient.get('search/movie', {
    searchParams: { query, language: 'ko-KR', include_adult: false, page }, signal,
  }).json<SearchMoviesResponse>();
}
