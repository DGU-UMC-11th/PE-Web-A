import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import { Icon } from "../common/icon";
import type { TmdbMovie } from "../../api/movies/models";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { useIsFavoriteInList } from "@/hooks/use-favorites-query";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";

// 목록(TmdbMovieListItem)과 상세(TmdbMovieDetail) 응답 모두 카드에 쓸 수 있도록 공통 필드만 받는다.
export type MovieCardItem = Pick<TmdbMovie, "id" | "title" | "poster_path" | "release_date">;

interface MovieCardProps {
  movie: MovieCardItem;
}

/**
 * 영화 포스터, 제목, 개봉일과 북마크 버튼을 보여주는 카드
 * 북마크 상태는 서버 즐겨찾기 목록(GET /favorites) 캐시로 판단하고, 누르면 추가·해제한다.
 * @param movie 표시할 영화 정보
 */
function MovieCard({ movie }: MovieCardProps) {
  const isFavorite = useIsFavoriteInList(movie.id);
  const isBookmarked = isFavorite === true;
  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const { toggleFavorite, isPending } = useToggleFavorite(movie.id, isFavorite);

  return (
    <article className="relative flex w-full flex-col">
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="flex flex-col"
      >
        {posterUrl ? (
  <img
    src={posterUrl}
    alt={`${movie.title} 포스터`}
    className="block aspect-[242/274] w-full rounded-[10px] object-cover"
  />
) : (
  <div className="flex aspect-[242/274] w-full items-center justify-center rounded-[10px] bg-line text-xs text-muted">
    이미지 없음
  </div>
)}
        <h3 className="mt-3 text-[15px] font-bold break-keep text-ink">{movie.title}</h3>
        <p className="mt-1 text-xs text-subtle">{movie.release_date}</p>
      </Link>

      <button
        type="button"
        className={cn(
          "absolute top-2.5 right-2.5 flex size-[34px] cursor-pointer items-center justify-center rounded-lg border border-white",
          isBookmarked ? "bg-brand" : "bg-black/60",
        )}
        onClick={toggleFavorite}
        disabled={isPending}
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