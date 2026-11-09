
import "./movie-card.css";
import type { TmdbMovieListItem } from "../api/movies/models";
import { BookmarkButton } from "./bookmark-button";

interface MovieCardProps {
  movie: TmdbMovieListItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="poster-wrapper">
        {movie.poster_path ? (
          <img
            className="movie-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={`${movie.title} 포스터`}
          />
        ) : (
          <div className="movie-poster">포스터 없음</div>
        )}

        <BookmarkButton movieId={movie.id} />
      </div>

      <h2 className="movie-title">{movie.title}</h2>
      <p className="movie-date">
        {movie.release_date || "개봉일 미정"}
      </p>
    </article>
  );
}
