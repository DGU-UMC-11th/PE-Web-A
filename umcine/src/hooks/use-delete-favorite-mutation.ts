import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFavorite } from "@/api/favorites/delete-favorite";
import type { Favorite, FavoriteStatus } from "@/api/favorites/models";
import { FAVORITE_QUERY_KEYS } from "@/hooks/use-favorites-query";

export function useDeleteFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFavorite,
    onSuccess: (_response, movieId) => {
      queryClient.setQueryData<FavoriteStatus>(FAVORITE_QUERY_KEYS.detail(movieId), {
        isFavorite: false,
      });
      queryClient.setQueryData<Favorite[]>(FAVORITE_QUERY_KEYS.list, (prev) =>
        prev?.filter((favorite) => favorite.movieId !== movieId),
      );
    },
    onError: () => {
      // 이미 해제된 상태(404) 등 캐시가 서버와 어긋났을 수 있어 다시 불러온다.
      queryClient.invalidateQueries({ queryKey: FAVORITE_QUERY_KEYS.all });
      alert("즐겨찾기 해제에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
