import { queryOptions } from "@tanstack/react-query";

import { getMovies, type GetMoviesRequest } from "./get-movies";
import { searchMovies, type SearchMoviesRequest } from "./search-movies";
import { getMovieDetail } from "./get-movie-detail";

export const movieQueryOptions = {
  list: ({ page = 1 }: GetMoviesRequest = {}) =>
    queryOptions({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    }),

  search: ({ query, page = 1 }: SearchMoviesRequest) => {
    const normalizedQuery = query.trim();

    return queryOptions({
      queryKey: ["movies", "search", { page, query: normalizedQuery }],
      queryFn: () => searchMovies({ query: normalizedQuery, page }),
      enabled: normalizedQuery.length > 0,
    });
  },

  detail: (movieId: number) =>
    queryOptions({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      enabled: Number.isInteger(movieId) && movieId > 0,
      staleTime: 30 * 1000,
    }),
};
