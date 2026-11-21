import { useQuery } from "@tanstack/react-query";
import { getFavoriteStatus } from "@/api/favorites/get-favorite-status";
import { FAVORITE_QUERY_KEYS } from "@/hooks/use-favorites-query";
import { useAuthStore } from "@/stores/auth-store";

// 영화 상세용. GET /favorites/{movieId}로 이 영화의 즐겨찾기 여부를 조회한다.
export function useFavoriteStatusQuery(movieId: number, enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: FAVORITE_QUERY_KEYS.detail(movieId),
    queryFn: () => getFavoriteStatus(movieId),
    enabled: enabled && Boolean(accessToken),
  });
}
