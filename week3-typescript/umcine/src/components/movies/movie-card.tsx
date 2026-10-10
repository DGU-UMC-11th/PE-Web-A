import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (id: number) => void;
}

export function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
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
        <button
          type="button"
          className={cn(
            "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60",
            movie.isBookmarked && "text-blue-600",
          )}
          aria-pressed={movie.isBookmarked}
          aria-label={movie.isBookmarked ? "북마크 해제" : "북마크 추가"}
          onClick={() => onToggleBookmark(movie.id)}
        >
          {movie.isBookmarked ? (
            <svg width="18" height="18" viewBox="80 32 24 24" fill="none" aria-hidden="true">
              <path
                d="M97 35H87C85.9 35 85.01 35.9 85.01 37L85 53L92 50L99 53V37C99 35.9 98.1 35 97 35Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="32 32 24 24" fill="none" aria-hidden="true">
              <path
                d="M49 35H39C37.9 35 37.01 35.9 37.01 37L37 53L44 50L51 53V37C51 35.9 50.1 35 49 35ZM49 50L44 47.82L39 50V37H49V50Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
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
