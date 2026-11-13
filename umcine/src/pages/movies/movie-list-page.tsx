import { useEffect, useState } from "react";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import MovieGrid from "../../components/movies/movie-grid";

/**
 * 영화 목록을 보여주는 페이지
 * 북마크 상태는 Zustand store에서 관리한다.
 */
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
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <h1 className="mb-6 text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">영화 목록</h1>
      {isLoading ? (
        <p className="text-muted">영화 목록을 불러오는 중이에요.</p>
      ) : errorMessage ? (
        <p className="text-muted">{errorMessage}</p>
      ) : movies.length === 0 ? (
        <p className="text-muted">조건에 맞는 영화가 없어요.</p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}