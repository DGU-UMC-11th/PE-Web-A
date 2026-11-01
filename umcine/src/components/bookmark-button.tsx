import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  className?: string;
}

export function BookmarkButton({ movieId, className }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <button
      type="button"
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      onClick={() => toggleBookmark(movieId)}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-bold text-white",
        isBookmarked ? "bg-blue-600" : "bg-black/60",
        className,
      )}
    >
      {isBookmarked ? "★ 북마크 해제" : "☆ 북마크 추가"}
    </button>
  );
}