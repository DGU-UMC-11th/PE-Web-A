import { useBookmarkStore } from "../../stores/bookmark-store";
import { cn } from "../../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  className?: string;
}

export function BookmarkButton({ movieId, className }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) => state.bookmarkedMovieIds.includes(movieId));
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60",
        className,
        isBookmarked && "text-blue-600",
      )}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      onClick={() => toggleBookmark(movieId)}
    >
      {isBookmarked ? (
        <svg width="18" height="18" viewBox="80 32 24 24" fill="none" aria-hidden="true">
          <path
            d="M97 35H87C85.9 35 85.01 35.9 85.01 37L85 53L92 50L99 53V37C99 35.9 98.1 35 97 35Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="32 32 24 24" fill="none" aria-hidden="true">
          <path
            d="M49 35H39C37.9 35 37.01 35.9 37.01 37L37 53L44 50L51 53V37C51 35.9 50.1 35 49 35ZM49 50L44 47.82L39 50V37H49V50Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
