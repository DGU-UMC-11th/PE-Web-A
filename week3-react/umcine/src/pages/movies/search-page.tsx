import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, type SubmitEvent } from 'react';
import { movies } from '../../data/movies';
import { cn } from '../../utils/cn';

/** URL 검색어가 변경될 때 key로 입력 초깃값도 함께 갱신한다. */
function SearchForm({ query }: { query: string }) {
  const [text, setText] = useState(query);
  const navigate = useNavigate({ from: '/search' });
  /** 기본 폼 새로고침을 막고 검색어를 URL에 저장한다. */
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = text.trim();
    void navigate({ search: next ? { query: next } : {} });
  }
  return <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
    <img src="/icons/search.svg" alt="" className="size-5" />
    <input aria-label="검색어" placeholder="예: 스파이더맨" value={text} onChange={event => setText(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none" />
    <button type="submit" className="rounded-md bg-[#20242c] px-5 py-2 text-sm font-semibold text-white">검색</button>
  </form>;
}

/** 검증된 URL 검색어로 제목과 원제를 필터링한다. */
export function SearchPage() {
  const { query } = useSearch({ from: '/search' });
  const normalized = query?.trim().toLowerCase() ?? '';
  const results = normalized ? movies.filter(movie => movie.title.toLowerCase().includes(normalized) || movie.originalTitle.toLowerCase().includes(normalized)) : [];
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 pb-12 pt-7">
    <div className={cn(!normalized && 'mx-auto max-w-[800px] pt-32')}>
      <h1 className={cn('mb-5 font-bold tracking-tight', normalized ? 'text-[32px]' : 'text-center text-3xl')}>{normalized ? '영화 검색' : '어떤 영화를 찾고 있나요?'}</h1>
      <SearchForm key={query ?? ''} query={query ?? ''} />
      {!normalized && <p className="mt-4 text-center text-sm text-gray-500">검색어를 입력해 주세요.</p>}
    </div>
    {normalized && <section className="mt-6" aria-live="polite">
      <h2 className="text-lg font-bold">‘{query}’ 검색 결과</h2>
      <p className="mb-5 mt-1 text-sm text-gray-500">영화 {results.length}편</p>
      {results.length === 0 ? <p className="py-20 text-center text-gray-500">검색 결과가 없어요.</p> :
        <ul className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          {results.map(movie => <li key={movie.id} className="flex gap-5 border-b border-gray-200 pb-6">
            <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} aria-label={`${movie.title} 상세 보기`} className="shrink-0">
              <img src={movie.posterPath} alt={`${movie.title} 포스터`} className="h-[200px] w-[134px] rounded-lg object-cover" />
            </Link>
            <div className="min-w-0 py-2">
              <h3 className="text-lg font-bold">{movie.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{movie.originalTitle}</p>
              <time className="text-xs text-gray-500" dateTime={movie.releaseDate.replaceAll('.', '-')}>{movie.releaseDate}</time>
              <p className="mb-4 mt-3 text-sm leading-6 text-gray-600">{movie.overview}</p>
              <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="text-sm font-semibold text-[#4164ed]">상세 보기 →</Link>
            </div>
          </li>)}
        </ul>}
    </section>}
  </main>;
}
