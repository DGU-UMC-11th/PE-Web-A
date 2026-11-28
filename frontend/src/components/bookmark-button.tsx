import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  favoriteDetailOptions,
  favoriteMutationOptions,
} from "../api/favorites/options";
import { useFavorites } from "../hooks/use-favorites";
import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  detail?: boolean;
}

export function BookmarkButton({ movieId, detail = false }: BookmarkButtonProps) {
  const { list, useLocal, ids } = useFavorites();
  const toggleLocal = useBookmarkStore((state) => state.toggleBookmark);
  const queryClient = useQueryClient();
  const canCheckStatus = detail && !useLocal && list.isSuccess;
  const status = useQuery({ ...favoriteDetailOptions(movieId), enabled: canCheckStatus });
  const options = favoriteMutationOptions(queryClient, movieId);
  const mutation = useMutation(options);
  const pending = useIsMutating({ mutationKey: options.mutationKey }) > 0;
  const source = canCheckStatus ? status : list;
  const favorited = canCheckStatus ? status.data ?? ids.includes(movieId) : ids.includes(movieId);
  const sourceFailed = !useLocal && source.isError;
  const action = sourceFailed ? "즐겨찾기 조회 다시 시도" : favorited ? "즐겨찾기 해제" : "즐겨찾기 추가";

  return (
    <>
      <button
        type="button"
        aria-label={action}
        aria-pressed={favorited}
        disabled={!useLocal && (pending || source.isPending)}
        className={detail
          ? "mt-4 inline-flex h-[42px] w-fit min-w-[120px] self-start items-center justify-center gap-2 rounded-[8px] px-4 text-[14px] font-bold text-white transition-colors"
          : cn(
            "absolute right-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-2 p-[7px]",
            favorited ? "border-[#2563eb] bg-[#2563eb]" : "border-white bg-[#17191e]",
          )}
        style={detail ? { backgroundColor: favorited ? "#1d4ed8" : "#2563eb", color: "#ffffff" } : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (useLocal) toggleLocal(movieId);
          else if (sourceFailed) void source.refetch();
          else mutation.mutate(!favorited);
        }}
      >
        <img
          className={detail ? "block h-[20px] w-[20px] shrink-0 brightness-0 invert" : "block h-6 w-6 brightness-0 invert"}
          src={favorited ? "/icons/movie-icons/bookmark.svg" : "/icons/movie-icons/bookmark-outline.svg"}
          alt=""
        />
        {detail && <span className="whitespace-nowrap">{sourceFailed ? "다시 시도" : "즐겨찾기"}</span>}
      </button>
      {mutation.isError && <p role="alert" className={detail ? "mt-2" : "sr-only"}>즐겨찾기를 변경하지 못했어요. 다시 시도해 주세요.</p>}
    </>
  );
}
