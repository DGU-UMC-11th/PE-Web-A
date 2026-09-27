import { useState } from "react";
import Header from "./components/header";
import MovieGrid from "./components/movie-grid";
import Pagination from "./components/pagination";
import { movies as initialMovies } from "./data/movies";
import type { Movie } from "./types/movie";
import "./App.css";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);

  function handleToggleBookmark(movieId: number) {
    setMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === movieId
          ? { ...movie, isBookmarked: !movie.isBookmarked }
          : movie
      )
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <h1 className="page-title">영화 목록</h1>
        <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
        <Pagination />
      </main>
      <footer className="footer">
        <p>This product uses the TMDb API but is not endorsed or certified by TMDb.</p>
      </footer>
    </div>
  );
}