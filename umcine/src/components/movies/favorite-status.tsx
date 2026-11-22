import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorite } from "@/api/favorites/get-favorites";
import {
  addFavorite,
  deleteFavorite,
  favoriteDetailKey,
  favoriteListKey,
} from "@/api/favorites/favorites";
import { useAuthStore } from "@/stores/auth-store";

async function getFavoriteStatus(movieId: number): Promise<boolean> {
  const response = await getFavorite(movieId);
  const result = response && typeof response === "object" && "result" in response
    ? response.result
    : response;

  if (response && typeof response === "object" &&
      "isSuccess" in response && response.isSuccess === false) {
    throw new Error("즐겨찾기 상태를 확인하지 못했어요.");
  }
  if (typeof result === "boolean") return result;
  if (result === null) return false;
  if (result && typeof result === "object") {
    if ("isFavorite" in result && typeof result.isFavorite === "boolean") {
      return result.isFavorite;
    }
    if ("movieId" in result && result.movieId === movieId) return true;
  }
  throw new Error("즐겨찾기 상태를 확인하지 못했어요.");
}

export function FavoriteStatus({ movieId }: { movieId: number }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const detailKey = favoriteDetailKey(movieId);
  const favoriteQuery = useQuery({
    queryKey: detailKey,
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (isFavorite: boolean) =>
      isFavorite ? deleteFavorite(movieId) : addFavorite(movieId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailKey }),
        queryClient.invalidateQueries({ queryKey: favoriteListKey }),
      ]);
    },
  });

  if (!accessToken) return <p>로그인하면 즐겨찾기에 추가할 수 있어요.</p>;
  if (favoriteQuery.isPending) return <p role="status">즐겨찾기를 확인하는 중이에요.</p>;
  if (favoriteQuery.isError) {
    return (
      <div>
        <p role="alert">즐겨찾기 상태를 확인하지 못했어요.</p>
        <button type="button" onClick={() => void favoriteQuery.refetch()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={mutation.isPending || favoriteQuery.isFetching}
        onClick={() => mutation.mutate(favoriteQuery.data)}
      >
        {favoriteQuery.data ? "즐겨찾기 삭제" : "즐겨찾기 추가"}
      </button>
      {mutation.isError && <p role="alert">즐겨찾기를 변경하지 못했어요.</p>}
    </div>
  );
}
