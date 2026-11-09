import type { MovieListItem } from "../../types/movie";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import type { TmdbMovieListItem } from "./models";

export function toMovieListItem(movie: TmdbMovieListItem): MovieListItem {
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date,
    posterPath: getTmdbPosterUrl(movie.poster_path) ?? "",
  };
}
