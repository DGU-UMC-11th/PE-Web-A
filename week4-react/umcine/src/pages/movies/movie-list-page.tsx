import { MovieGrid } from '../../components/movies/movie-grid';
import { Pagination } from '../../components/movies/pagination';
import { movies } from '../../data/movies';

/** 전체 영화 목록과 개별 북마크를 표시한다. */
export function MovieListPage() {
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <h1 className="mb-5 text-[32px] font-bold tracking-tight">영화 목록</h1>
    <MovieGrid movies={movies} />
    <Pagination />
  </main>;
}
