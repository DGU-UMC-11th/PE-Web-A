import { Link, useParams } from '@tanstack/react-router';
import { useMovies } from '../../components/movies/movie-context';
import { cn } from '../../utils/cn';

/** URL의 영화 ID로 상세 정보를 찾고 없는 ID는 안내한다. */
export function MovieDetailPage() {
  const { movieId } = useParams({ from: '/movies/$movieId' });
  const { movies, toggleBookmark } = useMovies();
  const movie = /^\d+$/.test(movieId) ? movies.find(item => item.id === Number(movieId)) : undefined;
  if (!movie) return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 py-20"><h1 className="mb-6 text-2xl font-bold">영화를 찾을 수 없어요.</h1><Link to="/" className="text-[#4164ed]">영화 목록으로 돌아가기</Link></main>;
  return <main className="flex-1">
    <section className="relative flex min-h-[360px] items-end overflow-hidden bg-gray-900 text-white">
      <img src={movie.backdropPath} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/10" />
      <div className="relative mx-auto w-full max-w-[1344px] px-8 pb-8 pt-32">
        <Link to="/" className="mb-5 inline-block text-sm text-white/80">← 영화 목록</Link>
        <h1 className="text-4xl font-bold tracking-tight">{movie.title}</h1>
        <p className="mt-2 text-white/80">{movie.originalTitle}</p>
        <p className="mt-2 text-sm text-white/80">{movie.releaseDate} · {movie.genres.join(' · ')} · {movie.runtime}</p>
      </div>
    </section>
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 px-6 py-6 font-[Pretendard,Arial,sans-serif] text-[#17191e] lg:min-h-[342px] lg:flex-row lg:px-20">
      <img
        src={movie.posterPath}
        alt={`${movie.title} 포스터`}
        className="h-[286px] w-[200px] shrink-0 rounded-[10px] bg-[#f6f7f9] object-cover shadow-[0_12px_30px_rgba(12,15,20,0.12)]"
      />
      <section className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <h2 className="text-[21px] leading-[25px] font-bold tracking-[-0.63px]">{movie.tagline}</h2>
        <p className="text-sm leading-6 text-[#606774]">{movie.overview}</p>
        <button
          type="button"
          aria-label={movie.isBookmarked ? '북마크 해제' : '북마크 추가'}
          aria-pressed={movie.isBookmarked}
          onClick={() => toggleBookmark(movie.id)}
          className={cn(
            'flex h-[42px] items-center justify-center gap-2 rounded-lg border border-white px-4 text-sm leading-[17px] font-extrabold text-white',
            movie.isBookmarked ? 'bg-[#1d4ed8]' : 'bg-[#2563eb]',
          )}
        >
          <img
            src={movie.isBookmarked ? '/icons/bookmark.svg' : '/icons/bookmark-outline.svg'}
            alt=""
            className="size-4 brightness-0 invert"
          />
          즐겨찾기
        </button>
      </section>
      <aside aria-label="내 평점" className="flex w-full shrink-0 flex-col items-start gap-2 pb-[41px] lg:w-[360px] lg:pl-[30px]">
        <h2 className="text-[21px] leading-[25px] font-bold tracking-[-0.63px]">내 평점</h2>
        <p className="text-xs leading-[14px] text-[#969da8]">별점은 필수, 후기는 선택이에요.</p>
        <div role="group" aria-label="영화 별점" className="flex gap-1">
          {[1, 2, 3, 4, 5].map(score => (
            <button key={score} type="button" disabled aria-label={`${score}점`} title="평점 기능 준비 중" className="flex size-[38px] items-center justify-center rounded-lg border border-[#e3e6eb] bg-white px-[6px] py-px">
              <span aria-hidden="true" className="size-6 bg-[#606774] mask-[url('/icons/star.svg')] mask-contain mask-center mask-no-repeat" />
            </button>
          ))}
        </div>
        <textarea disabled aria-label="영화 후기" placeholder="영화를 보고 느낀 점을 남겨보세요." className="h-[102px] w-full resize-none overflow-auto rounded-lg border border-[#e3e6eb] bg-white px-3 pt-4 pb-[18px] text-[13px] leading-5 placeholder:text-[#969da8]" />
        <button type="button" disabled title="평점 저장 기능 준비 중" className="flex h-[42px] w-full items-center justify-center rounded-lg border border-white bg-[#17191e] px-4 text-sm leading-[17px] font-extrabold text-white">평점 저장</button>
      </aside>
    </div>
  </main>;
}
