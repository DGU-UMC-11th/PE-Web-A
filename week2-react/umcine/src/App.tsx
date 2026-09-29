import { useState } from 'react';
import Header from './components/header';
import MovieGrid from './components/movie-grid';
import Pagination from './components/pagination';
import { movies as initialMovies } from './data/movies';
import './App.css';

/** 영화 배열을 관리하고 선택한 영화의 북마크만 변경한다. */
export default function App() {
  const [movies, setMovies] = useState(initialMovies);

  /**
   * 해당 영화의 북마크 상태를 반전한다.
   * @param movieId 북마크를 변경할 영화 ID
   */
  function handleToggleBookmark(movieId: number) {
    setMovies((currentMovies) => currentMovies.map((movie) =>
      movie.id === movieId ? { ...movie, isBookmarked: !movie.isBookmarked } : movie,
    ));
  }

  return (
    <>
      <Header />
      <main className="movie-page" id="movie-list">
        <h1>영화 목록</h1>
        <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
        <Pagination />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <img src="/images/logos/tmdb-logo.svg" alt="TMDB" />
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </footer>
    </>
  );
}
