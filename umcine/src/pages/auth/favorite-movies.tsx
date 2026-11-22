import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { favoriteListKey, getFavorites } from "../../api/favorites/favorites";

export function FavoriteMovies() {
  const favorites = useQuery({
    queryKey: favoriteListKey,
    queryFn: ({ signal }) => getFavorites(signal),
    retry: false,
  });

  return (
    <section aria-labelledby="favorite-movies-heading">
      <h2 id="favorite-movies-heading">즐겨찾기</h2>
      {favorites.isPending ? (
        <p role="status">즐겨찾기를 불러오는 중이에요.</p>
      ) : favorites.isError ? (
        <>
          <p role="alert">즐겨찾기를 불러오지 못했어요.</p>
          <button type="button" onClick={() => void favorites.refetch()}>다시 시도</button>
        </>
      ) : favorites.data.length === 0 ? (
        <p>즐겨찾기에 추가한 영화가 없어요.</p>
      ) : (
        <ul>
          {favorites.data.map(({ movieId, title }) => (
            <li key={movieId}>
              <Link to="/movies/$movieId" params={{ movieId: String(movieId) }}>
                {title || `영화 #${movieId}`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
