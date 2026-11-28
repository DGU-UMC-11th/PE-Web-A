import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
}

export function BookmarkButton({ movieId }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark,
  );

  return (
    <button
      type="button"
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      aria-pressed={isBookmarked}
      className={cn(
        "absolute right-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-2 p-[7px]",
        isBookmarked
          ? "border-[#2563eb] bg-[#2563eb]"
          : "border-white bg-[#17191e]",
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleBookmark(movieId);
      }}
    >
      <img
        className="block h-6 w-6 brightness-0 invert"
        src={isBookmarked
          ? "/icons/movie-icons/bookmark.svg"
          : "/icons/movie-icons/bookmark-outline.svg"}
        alt=""
      />
    </button>
  );
}
