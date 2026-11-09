import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { MovieGrid } from '../../components/movies/movie-grid';
import { Pagination } from '../../components/movies/pagination';
import { getMovies } from '../../api/movies/get-movies';
import { getMovieErrorMessage } from '../../utils/movies/get-movie-detail-error-message';

/** 페이지별 영화 조회 상태와 목록, 페이지 이동 버튼을 표시한다. */
export function MovieListPage() {
  const [page, setPage] = useState(1);
  const moviesQuery = useQuery({
    queryKey: ['movies', 'list', { page }],
    queryFn: ({ signal }) => getMovies({ page, signal }),
    placeholderData: keepPreviousData,
  });
  const movies = moviesQuery.data?.results ?? [];
  // TMDB 목록 API가 허용하는 페이지는 최대 500이다.
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, 500);
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <h1 className="mb-5 text-[32px] font-bold tracking-tight">영화 목록</h1>
    {moviesQuery.isPending ? <p role="status" className="py-20 text-center">{moviesQuery.isPaused ? '인터넷 연결을 기다리고 있어요.' : '영화 목록을 불러오는 중이에요.'}</p>
      : moviesQuery.isError ? <div role="alert" className="py-20 text-center"><p>{getMovieErrorMessage(moviesQuery.error, '영화 목록을 불러오지 못했어요.')}</p><button type="button" onClick={() => void moviesQuery.refetch()} disabled={moviesQuery.isFetching} className="mt-4 rounded bg-[#20242c] px-4 py-2 text-white">다시 시도</button></div>
      : movies.length === 0 ? <p className="py-20 text-center">조건에 맞는 영화가 없어요.</p>
      : <><MovieGrid movies={movies} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}
  </main>;
}
