import type { Movie } from '../../types/movie';
import { MovieCard } from './movie-card';

/** 고유 ID를 key로 사용해 영화 목록을 표시한다. */
export function MovieGrid({ movies, onToggleBookmark }: {
  movies: Movie[];
  onToggleBookmark: (movieId: number) => void;
}) {
  return <ul className="grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-3 xl:grid-cols-5">
    {movies.map(movie => <li key={movie.id} className="min-w-0"><MovieCard movie={movie} onToggleBookmark={onToggleBookmark} /></li>)}
  </ul>;
}
