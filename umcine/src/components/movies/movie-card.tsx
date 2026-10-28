import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { useBookmarkStore } from "../../stores/bookmark-store";
import { cn } from "../../utils/cn";
import { Icon } from "../common/icon";

interface MovieCardProps {
  movie: Movie;
}

/**
 * 영화 포스터, 제목, 개봉일과 북마크 버튼을 보여주는 카드
 * 북마크 상태는 Zustand store에서 읽고 바꾼다.
 * @param movie 표시할 영화 정보
 */
function MovieCard({ movie }: MovieCardProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movie.id),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <article className="relative flex w-full flex-col">
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="flex flex-col"
      >
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="block aspect-[242/274] w-full rounded-[10px] object-cover"
        />
        <h3 className="mt-3 text-[15px] font-bold break-keep text-ink">{movie.title}</h3>
        <p className="mt-1 text-xs text-subtle">{movie.releaseDate}</p>
      </Link>

      <button
        type="button"
        className={cn(
          "absolute top-2.5 right-2.5 flex size-[34px] cursor-pointer items-center justify-center rounded-lg border border-white",
          isBookmarked ? "bg-brand" : "bg-black/60",
        )}
        onClick={() => toggleBookmark(movie.id)}
        aria-label={`${movie.title} ${isBookmarked ? "북마크 해제" : "북마크 추가"}`}
        aria-pressed={isBookmarked}
      >
        <Icon
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          className="size-5 text-white"
        />
      </button>
    </article>
  );
}

export default MovieCard;