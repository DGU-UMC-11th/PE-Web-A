import MovieGrid from "../../components/movies/movie-grid";
import { movies } from "../../data/movies";

/**
 * 영화 목록을 보여주는 페이지
 * 북마크 상태는 Zustand store에서 관리한다.
 */
export function MovieListPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <h1 className="mb-6 text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">영화 목록</h1>
      <MovieGrid movies={movies} />
    </main>
  );
}