import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getMovieDetail } from "@/api/movies/get-movie-detail";
import { ProfileAvatar } from "@/components/my/profile-avatar";
import MovieGrid from "@/components/movies/movie-grid";
import Pagination from "@/components/movies/pagination";
import { useFavoritesQuery } from "@/hooks/use-favorites-query";
import { useMeQuery } from "@/hooks/use-me-query";

const sectionTitleClass = "text-lg/[21px] font-bold text-ink";
const infoLabelClass = "text-xs/[14px] text-subtle";
const infoValueClass = "text-base/[19px] font-bold break-all text-ink";

export function MyPage() {
  const meQuery = useMeQuery();
  // 서버에 저장된 즐겨찾기 목록에서 movieId만 꺼내 TMDB 상세를 불러온다.
  const favoritesQuery = useFavoritesQuery();
  const bookmarkedMovieIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];

  // 상세 화면과 같은 queryKey를 써서, 이미 본 영화는 캐시를 그대로 재사용한다.
  const bookmarkedMovies = useQueries({
    queries: bookmarkedMovieIds.map((movieId) => ({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      staleTime: 30 * 1000,
    })),
    combine: (results) => ({
      movies: results.flatMap((result) => (result.data ? [result.data] : [])),
      isPending: results.some((result) => result.isPending),
      hasError: results.some((result) => result.isError),
    }),
  });

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">내 정보</h1>
        <Link
          to="/my/edit"
          className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-lg bg-brand px-4 text-sm/[17px] font-extrabold whitespace-nowrap text-white"
        >
          정보 수정
        </Link>
      </div>

      <section className="mt-6 flex flex-col gap-5 border-t border-line pt-6">
        <h2 className={sectionTitleClass}>기본 정보</h2>
        {meQuery.isPending ? (
          <p className="text-muted">내 정보를 불러오는 중이에요.</p>
        ) : meQuery.isError ? (
          <p className="text-muted">내 정보를 불러오지 못했어요.</p>
        ) : (
          <div className="flex items-center gap-6">
            {/* 프로필 이미지 API가 없어 기본 아이콘을 보여준다. */}
            <ProfileAvatar imageUrl={null} />
            <dl className="flex min-w-0 flex-col gap-4 sm:flex-row sm:gap-[120px]">
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className={infoLabelClass}>닉네임</dt>
                <dd className={infoValueClass}>{meQuery.data.nickname}</dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className={infoLabelClass}>이메일</dt>
                <dd className={infoValueClass}>{meQuery.data.email}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-5 border-t border-line pt-6">
        <h2 className={sectionTitleClass}>내 즐겨찾기</h2>
        {favoritesQuery.isPending ? (
          <p className="text-muted">즐겨찾기한 영화를 불러오는 중이에요.</p>
        ) : favoritesQuery.isError ? (
          <p className="text-muted">즐겨찾기 목록을 불러오지 못했어요.</p>
        ) : bookmarkedMovieIds.length === 0 ? (
          <p className="text-muted">즐겨찾기한 영화가 없어요.</p>
        ) : bookmarkedMovies.isPending ? (
          <p className="text-muted">즐겨찾기한 영화를 불러오는 중이에요.</p>
        ) : (
          <>
            {bookmarkedMovies.hasError && (
              <p className="text-sm text-muted">일부 영화 정보를 불러오지 못했어요.</p>
            )}
            {bookmarkedMovies.movies.length > 0 && (
              <MovieGrid movies={bookmarkedMovies.movies} />
            )}
            <Pagination />
          </>
        )}
      </section>
    </main>
  );
}
