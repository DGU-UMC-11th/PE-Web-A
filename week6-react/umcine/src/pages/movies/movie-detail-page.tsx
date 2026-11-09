import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetail } from '../../api/movies/get-movie-detail';
import { getMovieDetailErrorMessage } from '../../utils/movies/get-movie-detail-error-message';
import { getTmdbPosterUrl, getTmdbBackdropUrl, formatRuntime } from '../../utils/movies/tmdb-image';
import { MovieImage } from '../../components/movies/movie-image';
import { BookmarkButton } from '../../components/movies/bookmark-button';

/** URL의 영화 ID를 검증한 뒤 유효한 ID에 대해서만 상세 화면을 연다. */
export function MovieDetailPage() {
  const { movieId } = useParams({ from: '/movies/$movieId' });
  const parsedId = /^\d+$/.test(movieId) ? Number(movieId) : NaN;
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) return <DetailMessage message="올바르지 않은 영화 번호예요." />;
  return <MovieDetailContent key={parsedId} movieId={parsedId} />;
}

/** 상세 조회 안내 메시지와 목록으로 돌아가는 링크를 표시한다. */
function DetailMessage({ message }: { message: string }) {
  return <main className="mx-auto w-full max-w-[1344px] flex-1 px-8 py-20"><h1 className="mb-6 text-2xl font-bold">{message}</h1><Link to="/" className="text-[#4164ed]">영화 목록으로 돌아가기</Link></main>;
}

/** 검증된 영화 ID의 상세 데이터를 조회하고 영화 정보와 북마크를 표시한다. */
function MovieDetailContent({ movieId }: { movieId: number }) {
  const movieQuery = useQuery({
    queryKey: ['movies', 'detail', movieId],
    queryFn: ({ signal }) => getMovieDetail(movieId, signal),
    staleTime: 30_000,
  });
  if (movieQuery.isPending) return <main className="flex-1 px-8 py-20 text-center"><p role="status">{movieQuery.isPaused ? '인터넷 연결을 기다리고 있어요.' : '영화 정보를 불러오는 중이에요.'}</p></main>;
  if (movieQuery.isError) return <DetailMessage message={getMovieDetailErrorMessage(movieQuery.error)} />;
  const movie = movieQuery.data;
  return <main className="flex-1">
    <section className="relative flex min-h-[360px] items-end overflow-hidden bg-gray-900 text-white">
      <MovieImage src={getTmdbBackdropUrl(movie.backdrop_path)} alt="영화 배경" className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/10" />
      <div className="relative mx-auto w-full max-w-[1344px] px-8 pb-8 pt-32">
        <Link to="/" className="mb-5 inline-block text-sm text-white/80">← 영화 목록</Link>
        <h1 className="text-4xl font-bold tracking-tight">{movie.title}</h1>
        <p className="mt-2 text-white/80">{movie.original_title}</p>
        <p className="mt-2 text-sm text-white/80">{movie.release_date || '개봉일 정보 없음'} · {movie.genres.map(genre => genre.name).join(' · ') || '장르 정보 없음'} · {formatRuntime(movie.runtime)}</p>
      </div>
    </section>
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 px-6 py-6 font-[Pretendard,Arial,sans-serif] text-[#17191e] lg:min-h-[342px] lg:flex-row lg:px-20">
      <MovieImage
        src={getTmdbPosterUrl(movie.poster_path)}
        alt={`${movie.title} 포스터`}
        className="h-[286px] w-[200px] shrink-0 rounded-[10px] bg-[#f6f7f9] object-cover shadow-[0_12px_30px_rgba(12,15,20,0.12)]"
      />
      <section className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <h2 className="text-[21px] leading-[25px] font-bold tracking-[-0.63px]">{movie.tagline || '줄거리'}</h2>
        <p className="text-sm leading-6 text-[#606774]">{movie.overview || '줄거리 정보가 없어요.'}</p>
        <BookmarkButton movieId={movie.id} title={movie.title} />
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
