
import "./movie-grid.css";
import type { CSSProperties } from "react";
import type { TmdbMovieListItem } from "../api/movies/models";
import MovieCard from "./movie-card";

interface MovieGridProps {
  movies: TmdbMovieListItem[];
  columns?: 3 | 5;
}

export default function MovieGrid({
  movies,
  columns = 5,
}: MovieGridProps) {
  return (
    <section
      className="movie-grid"
      style={{ "--grid-columns": columns } as CSSProperties}
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </section>
  );
}
