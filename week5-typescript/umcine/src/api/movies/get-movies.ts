import { tmdbClient } from "../tmdb-client";
import type { TmdbMovieListResponse } from "./models";
export interface GetMoviesRequest { page?: number }
export type GetMoviesResponse = TmdbMovieListResponse;
export async function getMovies({ page = 1 }: GetMoviesRequest = {}) {
  return tmdbClient.get("movie/popular", {
    searchParams: { language: "ko-KR", page },
  }).json<GetMoviesResponse>();
}
