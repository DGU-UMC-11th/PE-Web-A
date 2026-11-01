import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { MovieGrid } from "../../components/movies/movie-grid";
import { Pagination } from "../../components/movies/pagination";
import { RequestState } from "../../components/movies/request-state";

export function MovieListPage() {
  const { page } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await getMovies({ page });
        if (!ignore) {
          setMovies(response.results);
          setTotalPages(Math.min(response.total_pages, 500));
        }
      } catch (error) {
        if (!ignore) setError(error instanceof Error && error.message.startsWith("TMDB 환경") ? error.message : "영화 목록을 불러오지 못했어요.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, [page, attempt]);
  return <main className="mx-auto w-full max-w-290 flex-1 px-6 py-10 pb-16">
    <h1 className="mb-7 text-2xl font-extrabold text-gray-900">영화 목록</h1>
    <RequestState loading={loading} error={error} empty={movies.length === 0} retry={() => setAttempt((value) => value + 1)} />
    {!loading && !error && movies.length > 0 && <>
      <MovieGrid movies={movies} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(page) => { void navigate({ search: { page } }); }} />
    </>}
  </main>;
}
