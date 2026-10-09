
import "./movie-card.css";
import type { Movie } from "../types/movie";
import { BookmarkButton } from "./bookmark-button";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="poster-wrapper">
        <img
          className="movie-poster"
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
        />

        <BookmarkButton movieId={movie.id} />
      </div>

      <h2 className="movie-title">{movie.title}</h2>
      <p className="movie-date">{movie.releaseDate}</p>
    </article>
  );
}
