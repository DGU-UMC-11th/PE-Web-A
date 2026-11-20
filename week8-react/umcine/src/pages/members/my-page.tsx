import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMe } from '../../hooks/use-member';
import { useFavorites } from '../../hooks/use-favorites';
import { ErrorNotice, secondaryButton } from '../../components/form';
import { getMovieDetail } from '../../api/movies/get-movie-detail';
import { MovieImage } from '../../components/movies/movie-image';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';
import { BookmarkButton } from '../../components/movies/bookmark-button';

/** 회원 정보와 서버에서 가져온 즐겨찾기 목록을 표시한다. */
export function MyPage() {
  const me = useMe();
  const favorites = useFavorites();
  return <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
    <h1 className="mb-6 text-3xl font-bold">마이페이지</h1>
    <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
      {me.isPending ? <p role="status">내 정보를 불러오는 중이에요.</p> : me.isError ? <><ErrorNotice error={me.error} /><button onClick={() => void me.refetch()} className={secondaryButton}>다시 시도</button></> : <>
        <h2 className="text-xl font-bold">{me.data.nickname}님</h2><p className="mt-2 text-gray-600">{me.data.email}</p>
        <p className="mt-2 text-sm text-gray-500">가입일 {me.data.createdAt?.slice(0, 10)}</p>
        <Link to="/my/edit" className="mt-5 inline-block font-bold text-blue-700">내 정보 수정 →</Link></>}
    </section>
    <section><h2 className="mb-5 text-2xl font-bold">북마크한 영화</h2>
      {favorites.isPending ? <p role="status">북마크를 불러오는 중이에요.</p> : favorites.isError ? <><ErrorNotice error={favorites.error} /><button className={secondaryButton} onClick={() => void favorites.refetch()}>다시 시도</button></> : favorites.data.length === 0 ? <div className="rounded-xl bg-white p-10 text-center"><p>아직 북마크한 영화가 없어요.</p><Link to="/" className="mt-3 inline-block text-blue-700">영화 둘러보기</Link></div> :
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">{favorites.data.map(item => <FavoriteCard key={item.movieId} movieId={item.movieId} />)}</div>}
    </section>
  </main>;
}

/** 즐겨찾기의 TMDB 영화 ID로 카드 정보를 보충하며 영화 하나의 실패를 목록 전체로 전파하지 않는다. */
function FavoriteCard({ movieId }: { movieId: number }) {
  const movie = useQuery({ queryKey: ['movies', 'detail', movieId], queryFn: ({ signal }) => getMovieDetail(movieId, signal) });
  const title = movie.data?.title || `영화 #${movieId}`;
  return <article className="relative"><Link to="/movies/$movieId" params={{ movieId: String(movieId) }}>
    <MovieImage src={getTmdbPosterUrl(movie.data?.poster_path ?? null)} alt={`${title} 포스터`} className="aspect-[2/3] w-full rounded-xl object-cover" /><h3 className="mt-3 font-bold">{title}</h3></Link>
    <BookmarkButton movieId={movieId} title={title} compact />
    {movie.isPending && <p role="status" className="text-xs">영화 정보 불러오는 중…</p>}
    {movie.isError && <button className="mt-2 text-sm text-blue-700" onClick={() => void movie.refetch()}>영화 정보 다시 불러오기</button>}
  </article>;
}
