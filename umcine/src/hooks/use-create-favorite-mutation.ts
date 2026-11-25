import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFavorite } from "@/api/favorites/create-favorite";
import type { Favorite, FavoriteStatus } from "@/api/favorites/models";
import { FAVORITE_QUERY_KEYS } from "@/hooks/use-favorites-query";

export function useCreateFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFavorite,
    onSuccess: (response, movieId) => {
      // 응답에 등록된 즐겨찾기가 그대로 오므로 다시 요청하지 않고 캐시를 바로 고친다.
      queryClient.setQueryData<FavoriteStatus>(FAVORITE_QUERY_KEYS.detail(movieId), {
        isFavorite: true,
      });
      // 서버는 최근 등록순으로 내려주므로 맨 앞에 넣는다.
      queryClient.setQueryData<Favorite[]>(FAVORITE_QUERY_KEYS.list, (prev) =>
        prev
          ? [response.result, ...prev.filter((favorite) => favorite.movieId !== movieId)]
          : prev,
      );
    },
    onError: () => {
      // 이미 즐겨찾기된 상태(409) 등 캐시가 서버와 어긋났을 수 있어 다시 불러온다.
      queryClient.invalidateQueries({ queryKey: FAVORITE_QUERY_KEYS.all });
      alert("즐겨찾기에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
