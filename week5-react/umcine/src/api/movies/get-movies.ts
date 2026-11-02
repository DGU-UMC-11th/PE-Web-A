import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieListResponse } from './models';
export interface GetMoviesRequest { page?: number; signal?: AbortSignal }
export type GetMoviesResponse = TmdbMovieListResponse;
export function getMovies({ page = 1, signal }: GetMoviesRequest = {}) {
  return tmdbClient.get('movie/popular', { searchParams: { language: 'ko-KR', page }, signal }).json<GetMoviesResponse>();
}
