import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import type { Movie } from "../../types/movie";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark?: (movieId: number) => void;
}

export default function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-white relative">
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
      >
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="w-full h-auto block"
        />
        <div className="p-3">
          <h3 className="font-bold text-base mb-1">{movie.title}</h3>
          <p className="text-xs text-gray-500 mb-1">{movie.releaseDate}</p>
          <p className="text-sm line-clamp-2">{movie.overview}</p>
        </div>
      </Link>
      {onToggleBookmark && (
        <button
          type="button"
          onClick={() => onToggleBookmark(movie.id)}
          className={cn(
            "absolute right-2 top-2 rounded-full p-2 text-white text-xs",
            movie.isBookmarked ? "bg-blue-600" : "bg-black/60",
          )}
        >
          북마크
        </button>
      )}
    </article>
  );
}