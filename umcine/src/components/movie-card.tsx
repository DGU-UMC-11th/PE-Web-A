
import type { Movie } from "../types/movie";
import { Bookmark } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

export default function MovieCard({
  movie,
  onToggleBookmark,
}: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="poster-wrapper">
        <img
          className="movie-poster"
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
        />

        <button
          type="button"
          className="bookmark-button"
          aria-label={`${movie.title} 북마크 ${
            movie.isBookmarked ? "해제" : "추가"
          }`}
          aria-pressed={movie.isBookmarked}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <Bookmark
            size={24}
            color="white"
            fill={movie.isBookmarked ? "white" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      <h2>{movie.title}</h2>
      <p className="release-date">{movie.releaseDate}</p>
      <p className="genres">{movie.genres.join(" · ")}</p>
    </article>
  );
}
