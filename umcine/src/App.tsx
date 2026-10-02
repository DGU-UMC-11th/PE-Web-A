import { useState } from "react";
import Header from "./components/header";
import MovieGrid from "./components/movie-grid";
import Pagination from "./components/pagination";
import { movies as initialMovies } from "./data/movies";
import "./App.css";

/**
 * 헤더, 영화 목록, 페이지네이션으로 구성된 메인 화면
 * 영화 목록과 북마크 상태를 관리한다.
 */
export default function App() {
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
    <div className="app">
      <Header />
      <main className="app__content">
        <h1 className="app__title">영화 목록</h1>
        <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
        <Pagination />
      </main>
    </div>
  );
}
