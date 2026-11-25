import { queryOptions, useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/api/favorites/get-favorites";
import { useAuthStore } from "@/stores/auth-store";

export const FAVORITE_QUERY_KEYS = {
  all: ["favorites"] as const,
  list: ["favorites", "list"] as const,
  detail: (movieId: number) => ["favorites", "detail", movieId] as const,
};

const favoritesQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: FAVORITE_QUERY_KEYS.list,
    queryFn: getFavorites,
    enabled,
  });

// 내 즐겨찾기 목록. 로그인 전이면 요청하지 않는다.
export function useFavoritesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery(favoritesQueryOptions(Boolean(accessToken)));
}

/**
 * 목록·검색 카드용. 카드마다 요청하지 않고 GET /favorites 목록 캐시 하나로 즐겨찾기 여부를 판단한다.
 * @returns 즐겨찾기 여부, 로그인했지만 목록이 아직 없으면 undefined
 */
export function useIsFavoriteInList(movieId: number) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data } = useQuery({
    ...favoritesQueryOptions(Boolean(accessToken)),
    select: (favorites) => favorites.some((favorite) => favorite.movieId === movieId),
  });
  return accessToken ? data : false;
}
