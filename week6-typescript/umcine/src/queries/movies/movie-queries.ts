import { queryOptions } from "@tanstack/react-query";
import { getMovies } from "../../api/movies/get-movies";
import { searchMovies } from "../../api/movies/search-movies";
import { getMovieDetail } from "../../api/movies/get-movie-detail";

export const movieQueries = {
  list: (page: number) => queryOptions({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  }),
  search: (query: string, page: number) => {
    const normalizedQuery = query.trim();
    return queryOptions({
      queryKey: ["movies", "search", { query: normalizedQuery, page }],
      queryFn: () => searchMovies({ query: normalizedQuery, page }),
      enabled: normalizedQuery.length > 0,
    });
  },
  detail: (movieId: number) => queryOptions({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
    staleTime: 30 * 1000,
  }),
};
