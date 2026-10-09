import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";

import type { Movie } from "../../types/movie";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

export default function MovieCard({
  movie,
  onToggleBookmark,
}: MovieCardProps) {
  return (
    <article className="flex w-full min-w-0 flex-col gap-1">
      <div className="relative h-[274px] w-full overflow-hidden rounded-lg">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          <img
            className="block h-full w-full object-cover"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          />
        </Link>

        <button
          className={cn(
            "absolute right-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-2 p-[7px]",
            movie.isBookmarked
              ? "border-[#2563eb] bg-[#2563eb]"
              : "border-white bg-[#17191e]"
          )}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img
            className="block h-6 w-6 brightness-0 invert"
            src={
              movie.isBookmarked
                ? "/icons/movie-icons/bookmark.svg"
                : "/icons/movie-icons/bookmark-outline.svg"
            }
            alt="북마크"
          />
        </button>
      </div>

      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="no-underline"
      >
        <h2 className="m-0 text-[14px] font-extrabold leading-5 text-[#17191e]">
          {movie.title}
        </h2>
      </Link>

      <p className="m-0 text-xs font-normal leading-4 text-[#969da8]">
        {movie.releaseDate}
      </p>
    </article>
  );
}