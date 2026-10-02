import type { Movie } from "../types/movie";
import MovieCard from "./movie-card";
import "./movie-grid.css";

interface MovieGridProps {
  movies: Movie[];
  onToggleBookmark: (movieId: number) => void;
}

/**
 * 영화 카드 목록을 그리드 형태로 보여준다.
 * @param movies 표시할 영화 목록
 * @param onToggleBookmark 각 카드의 북마크 버튼 클릭 시 호출되는 콜백
 */
function MovieGrid({ movies, onToggleBookmark }: MovieGridProps) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onToggleBookmark={onToggleBookmark} />
      ))}
    </div>
  );
}

export default MovieGrid;
