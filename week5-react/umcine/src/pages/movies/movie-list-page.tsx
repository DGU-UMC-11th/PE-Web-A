import { useEffect, useState } from 'react';
import { MovieGrid } from '../../components/movies/movie-grid';
import { Pagination } from '../../components/movies/pagination';
import { getMovies } from '../../api/movies/get-movies';
import type { TmdbMovieListItem } from '../../api/movies/models';
import { getMovieErrorMessage } from '../../utils/movies/get-movie-detail-error-message';

export function MovieListPage() {
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function loadMovies() {
      try {
        const response = await getMovies({ signal: controller.signal });
        if (!ignore) setMovies(response.results);
      } catch (error) {
        if (!ignore) setErrorMessage(getMovieErrorMessage(error, '영화 목록을 불러오지 못했어요.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadMovies();
    return () => { ignore = true; controller.abort(); };
  }, []);
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <h1 className="mb-5 text-[32px] font-bold tracking-tight">영화 목록</h1>
    {isLoading ? <p role="status" className="py-20 text-center">영화 목록을 불러오는 중이에요.</p>
      : errorMessage ? <p role="alert" className="py-20 text-center">{errorMessage}</p>
      : movies.length === 0 ? <p className="py-20 text-center">조건에 맞는 영화가 없어요.</p>
      : <><MovieGrid movies={movies} /><Pagination /></>}
  </main>;
}
