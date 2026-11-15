import { Link } from "@tanstack/react-router";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { BookmarkButton } from "../bookmark-button";
import { MovieImage } from "./movie-image";

interface MovieCardProps {
  movie: TmdbMovieListItem;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[10px] bg-white shadow">
      <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
        <MovieImage
          src={getTmdbPosterUrl(movie.poster_path)}
          alt={`${movie.title} 포스터`}
          className="aspect-[2/3] w-full"
        />
        <div className="p-3">
          <h3 className="font-bold">{movie.title}</h3>
          <p className="text-sm text-neutral-500">{movie.release_date || "개봉일 정보 없음"}</p>
        </div>
      </Link>
      <BookmarkButton movieId={movie.id} className="absolute right-2 top-2" />
    </article>
  );
}