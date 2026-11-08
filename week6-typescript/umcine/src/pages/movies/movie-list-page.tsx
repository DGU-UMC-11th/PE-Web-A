import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { movieQueries } from "../../queries/movies/movie-queries";
import { MovieGrid } from "../../components/movies/movie-grid";
import { Pagination } from "../../components/movies/pagination";
import { RequestState } from "../../components/movies/request-state";
import { QueryFeedback } from "../../components/movies/query-feedback";

export function MovieListPage() {
  const { page } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const moviesQuery = useQuery(movieQueries.list(page));
  const movies = moviesQuery.data?.results ?? [];
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, 500);
  const error = moviesQuery.isError ? "영화 목록을 불러오지 못했어요." : null;
  const refetch = () => { void moviesQuery.refetch(); };

  return (
    <main className="mx-auto w-full max-w-290 flex-1 px-6 py-10 pb-16">
      <h1 className="mb-7 text-2xl font-extrabold text-gray-900">영화 목록</h1>
      <QueryFeedback
        isFetching={moviesQuery.isFetching && !moviesQuery.isPending}
        isPaused={moviesQuery.isPaused}
        errorMessage={moviesQuery.data ? error : null}
        refetch={refetch}
      />
      <RequestState
        loading={moviesQuery.isPending && !moviesQuery.isPaused}
        error={moviesQuery.data ? null : error}
        empty={moviesQuery.isSuccess && movies.length === 0}
        retry={refetch}
      />
      {moviesQuery.data && movies.length > 0 && (
        <>
          <MovieGrid movies={movies} />
          <Pagination currentPage={page} totalPages={totalPages}
            onPageChange={(page) => { void navigate({ search: { page } }); }} />
        </>
      )}
    </main>
  );
}
