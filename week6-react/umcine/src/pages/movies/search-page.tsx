import { BookmarkButton } from '../../components/movies/bookmark-button';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, type SubmitEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '../../api/movies/search-movies';
import { getMovieErrorMessage } from '../../utils/movies/get-movie-detail-error-message';
import { MovieImage } from '../../components/movies/movie-image';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';
import { cn } from '../../utils/cn';

/** URL 검색어가 변경될 때 key로 입력 초깃값도 함께 갱신한다. */
function SearchForm({ query, onRetry }: { query: string; onRetry: () => void }) {
  const [text, setText] = useState(query);
  const navigate = useNavigate({ from: '/search' });
  /** 기본 폼 새로고침을 막고 검색어를 URL에 저장한다. */
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = text.trim();
    if (next && next === query.trim()) {
      onRetry();
      return;
    }
    void navigate({ search: next ? { query: next } : {} });
  }
  return <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
    <img src="/icons/search.svg" alt="" className="size-5" />
    <input aria-label="검색어" placeholder="예: 스파이더맨" value={text} onChange={event => setText(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-2" />
    <button type="submit" className="rounded-md bg-[#20242c] px-5 py-2 text-sm font-semibold text-white">검색</button>
  </form>;
}

export function SearchPage() {
  const { query = '' } = useSearch({ from: '/search' });
  return <SearchContent key={query} query={query} />;
}

function SearchContent({ query }: { query: string }) {
  const normalized = query.trim();
  const searchQuery = useQuery({
    queryKey: ['movies', 'search', { query: normalized }],
    queryFn: ({ signal }) => searchMovies({ query: normalized, signal }),
    enabled: normalized.length > 0,
  });
  const data = searchQuery.data;
  const results = data?.results ?? [];
  const isLoading = searchQuery.isLoading;
  const errorMessage = searchQuery.isError
    ? getMovieErrorMessage(searchQuery.error, '검색 결과를 불러오지 못했어요.')
    : null;
  function retrySearch() {
    if (normalized && !searchQuery.isFetching) void searchQuery.refetch();
  }
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <div className={cn(!normalized && 'mx-auto max-w-[800px] pt-32')}>
      <h1 className={cn('mb-5 font-bold tracking-tight', normalized ? 'text-[32px]' : 'text-center text-3xl')}>{normalized ? '영화 검색' : '어떤 영화를 찾고 있나요?'}</h1>
      <SearchForm key={query ?? ''} query={query ?? ''} onRetry={retrySearch} />
      {!normalized && <p className="mt-4 text-center text-sm text-gray-500">검색어를 입력해 주세요.</p>}
    </div>
    {normalized && <section className="mt-6" aria-live="polite">
      <h2 className="text-lg font-bold">‘{query}’ 검색 결과</h2>
      {searchQuery.isSuccess && <p className="mb-5 mt-1 text-sm text-gray-500">영화 {data?.total_results ?? 0}편</p>}
      {searchQuery.isPaused && searchQuery.isPending ? <p role="status" className="py-20 text-center">인터넷 연결을 기다리고 있어요.</p> : isLoading ? <p role="status" className="py-20 text-center">검색 결과를 불러오는 중이에요.</p> : errorMessage ? <p role="alert" className="py-20 text-center">{errorMessage}</p> : results.length === 0 ? <p className="py-20 text-center text-gray-500">검색 결과가 없어요.</p> :
        <ul className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          {results.map(movie => <li key={movie.id} className="flex gap-5 border-b border-gray-200 pb-6">
            <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} aria-label={`${movie.title} 상세 보기`} className="shrink-0">
              <MovieImage src={getTmdbPosterUrl(movie.poster_path)} alt={`${movie.title} 포스터`} className="h-[200px] w-[134px] rounded-lg object-cover" />
            </Link>
            <div className="min-w-0 py-2">
              <h3 className="text-lg font-bold">{movie.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{movie.original_title}</p>
              <time className="text-xs text-gray-500" dateTime={movie.release_date}>{movie.release_date || '개봉일 정보 없음'}</time>
              <p className="mb-4 mt-3 text-sm leading-6 text-gray-600">{movie.overview}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="text-sm font-semibold text-[#4164ed]">상세 보기 →</Link>
                <BookmarkButton movieId={movie.id} title={movie.title} />
              </div>
            </div>
          </li>)}
        </ul>}
    </section>}
  </main>;
}
