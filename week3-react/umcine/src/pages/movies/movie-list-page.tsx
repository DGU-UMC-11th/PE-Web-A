import { MovieGrid } from '../../components/movies/movie-grid';
import { Pagination } from '../../components/movies/pagination';
import { useMovies } from '../../components/movies/movie-context';

/** 전체 영화 목록과 개별 북마크를 표시한다. */
export function MovieListPage() {
  const { movies, toggleBookmark } = useMovies();
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <h1 className="mb-5 text-[32px] font-bold tracking-tight">영화 목록</h1>
    <MovieGrid movies={movies} onToggleBookmark={toggleBookmark} />
    <Pagination />
  </main>;
}
