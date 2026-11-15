import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMovies } from "../../api/movies/get-movies";
import { MovieGrid } from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { StatusMessage } from "../../components/status-message";

// TMDB는 500페이지까지만 조회할 수 있어요.
const MAX_PAGE = 500;

export function MovieListPage() {
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, MAX_PAGE);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-bold">영화 목록</h1>

      {moviesQuery.isPending ? (
        <StatusMessage message="영화 목록을 불러오는 중이에요." />
      ) : moviesQuery.isError ? (
        <StatusMessage message="영화 목록을 불러오지 못했어요." tone="error" />
      ) : movies.length === 0 ? (
        <StatusMessage message="조건에 맞는 영화가 없어요." />
      ) : (
        <>
          <MovieGrid movies={movies} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}