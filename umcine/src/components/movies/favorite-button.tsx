import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavoriteStatus, removeFavorite } from "../../api/favorites";
import { useAuthStore } from "../../stores/auth-store";

interface FavoriteButtonProps {
  movieId: number;
}

export function FavoriteButton({ movieId }: FavoriteButtonProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const statusQuery = useQuery({
    queryKey: ["favorites", "status", movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken),
  });

  // 등록·해제에 성공하면 즐겨찾기 관련 캐시를 전부 다시 조회
  const refreshFavorites = () => {
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: refreshFavorites,
    onError: () => alert("즐겨찾기 등록에 실패했어요."),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: refreshFavorites,
    onError: () => alert("즐겨찾기 해제에 실패했어요."),
  });

  if (!accessToken) {
    return (
      <Link to="/login" className="text-sm underline">
        로그인하고 즐겨찾기하기
      </Link>
    );
  }

  const isFavorite = statusQuery.data ?? false;
  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleClick = () => {
    if (isFavorite) {
      removeMutation.mutate(movieId);
    } else {
      addMutation.mutate(movieId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={statusQuery.isLoading || isPending}
      className="self-start rounded border border-neutral-300 px-4 py-2 disabled:opacity-40"
    >
      {isFavorite ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"}
    </button>
  );
}