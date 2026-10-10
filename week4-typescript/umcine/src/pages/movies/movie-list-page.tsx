import { useMemo, useState } from "react";
import { MovieGrid } from "../../components/movies/movie-grid";
import { Pagination } from "../../components/movies/pagination";
import { movies } from "../../data/movies";

const MOVIES_PER_PAGE = 10;

export function MovieListPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(movies.length / MOVIES_PER_PAGE));

  const pagedMovies = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    return movies.slice(start, start + MOVIES_PER_PAGE);
  }, [currentPage]);

  return (
    <main className="mx-auto max-w-290 flex-1 px-6 py-10 pb-16">
      <h1 className="mb-7 text-2xl font-extrabold text-gray-900">영화 목록</h1>
      <MovieGrid movies={pagedMovies} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
