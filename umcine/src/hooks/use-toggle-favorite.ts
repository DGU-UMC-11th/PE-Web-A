import { useNavigate } from "@tanstack/react-router";
import { useCreateFavoriteMutation } from "@/hooks/use-create-favorite-mutation";
import { useDeleteFavoriteMutation } from "@/hooks/use-delete-favorite-mutation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * 즐겨찾기 버튼 공통 동작. 로그인 전이면 /login으로 보내고, 아니면 상태에 따라 추가하거나 해제한다.
 * @param movieId 영화 ID
 * @param isFavorite 현재 즐겨찾기 여부 (아직 모르면 undefined)
 */
export function useToggleFavorite(movieId: number, isFavorite: boolean | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const createFavoriteMutation = useCreateFavoriteMutation();
  const deleteFavoriteMutation = useDeleteFavoriteMutation();
  const isPending = createFavoriteMutation.isPending || deleteFavoriteMutation.isPending;

  const toggleFavorite = () => {
    if (!accessToken) {
      navigate({ to: "/login" });
      return;
    }
    // 현재 상태를 아직 모르거나 요청 중이면 무시한다.
    if (isFavorite === undefined || isPending) return;

    if (isFavorite) {
      deleteFavoriteMutation.mutate(movieId);
    } else {
      createFavoriteMutation.mutate(movieId);
    }
  };

  return { toggleFavorite, isPending };
}
