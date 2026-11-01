import { useEffect, useState } from "react";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { MovieGrid } from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { StatusMessage } from "../../components/status-message";

export function MovieListPage() {
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMovies({ page: 1 });
        if (!ignore) setMovies(response.results);
      } catch {
        if (!ignore) setErrorMessage("영화 목록을 불러오지 못했어요.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadMovies();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-bold">영화 목록</h1>

      {isLoading ? (
        <StatusMessage message="영화 목록을 불러오는 중이에요." />
      ) : errorMessage ? (
        <StatusMessage message={errorMessage} tone="error" />
      ) : movies.length === 0 ? (
        <StatusMessage message="조건에 맞는 영화가 없어요." />
      ) : (
        <>
          <MovieGrid movies={movies} />
          <Pagination />
        </>
      )}
    </main>
  );
}