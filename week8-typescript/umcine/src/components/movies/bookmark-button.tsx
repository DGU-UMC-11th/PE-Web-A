import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";
import { addFavorite, getFavorite, removeFavorite } from "../../api/members/account-api";
import { cn } from "../../utils/cn";

export function BookmarkButton({ movieId, className }: { movieId: number; className?: string }) {
  const { accessToken, session } = useAuthStore();
  const client = useQueryClient();
  const navigate = useNavigate();
  const favorite = useQuery({
    queryKey: ["favorites", session, movieId], queryFn: () => getFavorite(movieId),
    enabled: !!accessToken, retry: false,
  });
  const mutation = useMutation({
    mutationFn: () => favorite.data?.isFavorite ? removeFavorite(movieId) : addFavorite(movieId),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["favorites", session] }); },
  });
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <button type="button" aria-label={favorite.data?.isFavorite ? "북마크 해제" : "북마크 추가"}
        aria-pressed={!!favorite.data?.isFavorite}
        disabled={mutation.isPending || (!!accessToken && (favorite.isPending || favorite.isError))}
        className={cn("grid size-9 place-items-center rounded-lg border border-white/50 bg-black/65 text-white disabled:opacity-50",
          favorite.data?.isFavorite && "bg-blue-600")}
        onClick={() => {
          if (!accessToken) { void navigate({ to: "/login" }); return; }
          mutation.mutate();
        }}>
        <img src={favorite.data?.isFavorite ? "/icons/movie-icons/bookmark.svg" : "/icons/movie-icons/bookmark-outline.svg"}
          alt="" className="size-5 invert" />
      </button>
      {mutation.isError && <span role="alert" className="rounded bg-white p-1 text-xs text-red-700">변경에 실패했어요.</span>}
      {favorite.isError && accessToken && <button type="button" className="bg-white text-xs" onClick={() => void favorite.refetch()}>다시 시도</button>}
    </span>
  );
}
