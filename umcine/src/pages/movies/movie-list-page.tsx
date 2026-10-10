import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { movies } from "../../data/movies";
import "../../App.css";

export function MovieListPage() {
  return (
    <main className="main-content">
      <h1 className="page-title">영화 목록</h1>

      <MovieGrid movies={movies} />

      <Pagination />
    </main>
  );
}