import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../../api/favorites";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { getMe } from "../../api/members/me";

export function MyPage() {
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
  });

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">내 정보</h1>

      {meQuery.isPending ? (
        <p>내 정보를 불러오는 중이에요.</p>
      ) : meQuery.isError ? (
        <p>내 정보를 불러오지 못했어요.</p>
      ) : (
        <div className="flex flex-col gap-3 rounded border border-neutral-300 p-6">
          <p>이메일: {meQuery.data.email}</p>
          <p>닉네임: {meQuery.data.nickname}</p>
          <p>가입일: {meQuery.data.createdAt.slice(0, 10)}</p>
        </div>
      )}

      <Link
        to="/mypage/edit"
        className="mt-6 block rounded bg-neutral-900 py-3 text-center font-bold text-white"
      >
        정보 수정
      </Link>

      <h2 className="mb-4 mt-10 text-xl font-bold">내 즐겨찾기</h2>
      {favoritesQuery.isPending ? (
        <p>즐겨찾기를 불러오는 중이에요.</p>
      ) : favoritesQuery.isError ? (
        <p>즐겨찾기를 불러오지 못했어요.</p>
      ) : favoritesQuery.data.length === 0 ? (
        <p>아직 즐겨찾기한 영화가 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {favoritesQuery.data.map((favorite) => (
            <FavoriteItem key={favorite.favoriteId} movieId={favorite.movieId} />
          ))}
        </ul>
      )}
    </main>
  );
}

// 즐겨찾기에는 영화 번호만 있어서, 제목은 상세 API로 가져와요 (상세 화면과 같은 캐시)
function FavoriteItem({ movieId }: { movieId: number }) {
  const movieQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
  });

  return (
    <li>
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movieId) }}
        className="underline"
      >
        {movieQuery.data?.title ?? `영화 #${movieId}`}
      </Link>
    </li>
  );
}