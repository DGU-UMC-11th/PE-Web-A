import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { Bookmark } from "lucide-react";
import { cn } from "../../utils/cn";
import { useBookmarkStore } from "../../stores/bookmark-store";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movie.id)
  );

  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark
  );

  return (
    <article className="overflow-hidden rounded-[10px] bg-white">
      <div className="poster-wrapper">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          <img
            className="movie-poster"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          />
        </Link>

        <button
          type="button"
          className={cn(
            "absolute right-2 top-2 rounded-full p-2 text-white",
            isBookmarked ? "bg-blue-600" : "bg-black/60"
          )}
          aria-label={`${movie.title} 북마크 ${
            isBookmarked ? "해제" : "추가"
          }`}
          aria-pressed={isBookmarked}
          onClick={() => toggleBookmark(movie.id)}
        >
          <Bookmark
            size={24}
            color="white"
            fill={isBookmarked ? "white" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      <h2>{movie.title}</h2>

      <p className="release-date">
        {movie.releaseDate}
      </p>

      <p className="genres">
        {movie.genres.join(" · ")}
      </p>
    </article>
  );
}