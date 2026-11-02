import { tmdbClient } from '../tmdb-client';
import type { TmdbMovieDetail } from './models';
export type GetMovieDetailResponse = TmdbMovieDetail;
export function getMovieDetail(movieId: number, signal?: AbortSignal) {
  return tmdbClient.get(`movie/${movieId}`, { searchParams: { language: 'ko-KR' }, signal }).json<GetMovieDetailResponse>();
}
