import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { BookmarkButton } from "./bookmark-button";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="flex flex-col text-left">
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-[10px] bg-gray-100">
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
          <img
            className="block h-full w-full object-cover"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          />
        </Link>
        <BookmarkButton movieId={movie.id} className="absolute right-2.5 top-2.5" />
      </div>
      <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
        <h3 className="mt-3 text-[15px] font-bold leading-snug text-gray-900">
          {movie.title}
        </h3>
      </Link>
      <p className="mt-1 text-[13px] text-gray-500">{movie.releaseDate}</p>
    </article>
  );
}
