import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieListResponse } from './models';
export interface SearchMoviesRequest { query: string; page?: number; signal?: AbortSignal }
export type SearchMoviesResponse = TmdbMovieListResponse;
export function searchMovies({ query, page = 1, signal }: SearchMoviesRequest) {
  return tmdbClient.get('search/movie', {
    searchParams: { query, language: 'ko-KR', include_adult: false, page }, signal,
  }).json<SearchMoviesResponse>();
}
