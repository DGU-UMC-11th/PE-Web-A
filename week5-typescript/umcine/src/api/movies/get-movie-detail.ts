import { tmdbClient } from "../tmdb-client";
import type { TmdbMovieDetail } from "./models";
export type GetMovieDetailResponse = TmdbMovieDetail;
export async function getMovieDetail(movieId: number) {
  return tmdbClient.get(`movie/${movieId}`, {
    searchParams: { language: "ko-KR" },
  }).json<GetMovieDetailResponse>();
}
