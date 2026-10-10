import { useState } from "react";
import MovieGrid from "../../components/movies/movie-grid";
import { movies as initialMovies } from "../../data/movies";

/**
 * 영화 목록을 보여주는 페이지
 * 영화 목록과 북마크 상태를 관리한다.
 */
export function MovieListPage() {
  const [movies, setMovies] = useState(initialMovies);

  /**
   * 해당 영화의 북마크 상태를 반전시킨다.
   * @param movieId 북마크를 토글할 영화 id
   */
  const handleToggleBookmark = (movieId: number) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === movieId ? { ...movie, isBookmarked: !movie.isBookmarked } : movie
      )
    );
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <h1 className="mb-6 text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">영화 목록</h1>
      <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
    </main>
  );
}
