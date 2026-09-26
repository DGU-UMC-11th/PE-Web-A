import type { Movie } from "../types/movie";
import "./movie-card.css";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article className="movie-card">
      <img src={movie.posterPath} alt={`${movie.title} 포스터`} className="movie-card__poster" />

      <button
        type="button"
        className={`movie-card__bookmark-button${movie.isBookmarked ? " movie-card__bookmark-button--active" : ""}`}
        onClick={() => onToggleBookmark(movie.id)}
        aria-label={movie.isBookmarked ? "북마크 해제" : "북마크 추가"}
        aria-pressed={movie.isBookmarked}
      >
        <img
          src={movie.isBookmarked ? "/icons/bookmark.svg" : "/icons/bookmark-outline.svg"}
          alt=""
          className="movie-card__bookmark-icon"
        />
      </button>

      <h3 className="movie-card__title">{movie.title}</h3>
      <p className="movie-card__release-date">{movie.releaseDate}</p>
    </article>
  );
}

export default MovieCard;
