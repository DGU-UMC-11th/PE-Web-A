import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { Icon } from "../../components/common/icon";
import { cn } from "../../utils/cn";
import { formatRuntime } from "../../utils/movies/format-runtime";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";
import { MyRatingPanel } from "@/components/movies/my-rating-panel";
import { useFavoriteStatusQuery } from "@/hooks/use-favorite-status-query";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";
import { useAuthStore } from "@/stores/auth-store";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);
  const isValidMovieId = Number.isInteger(parsedMovieId) && parsedMovieId > 0;

  const {
    data: movie,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["movies", "detail", parsedMovieId],
    queryFn: () => getMovieDetail(parsedMovieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  // 상세에서는 GET /favorites/{movieId}로 이 영화의 즐겨찾기 여부를 확인한다.
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteStatusQuery = useFavoriteStatusQuery(parsedMovieId, isValidMovieId);
  const isFavorite = accessToken ? favoriteStatusQuery.data?.isFavorite : false;
  const isBookmarked = isFavorite === true;
  const { toggleFavorite, isPending: isFavoritePending } = useToggleFavorite(
    parsedMovieId,
    isFavorite,
  );

  if (!isValidMovieId) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        올바르지 않은 영화 번호예요.
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        영화 정보를 불러오는 중이에요.
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        {getMovieDetailErrorMessage(error)}
      </main>
    );
  }

  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);

  return (
    <main>
      <section
        className={cn(
          "relative h-[300px] w-full bg-cover bg-center sm:h-[360px]",
          !backdropUrl && "bg-muted",
        )}
        style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : undefined}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        {!backdropUrl && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
            이미지 없음
          </span>
        )}
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-4 py-6 lg:px-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1 self-start text-[13px]/4 font-bold text-white"
          >
            <Icon name="chevron-left" className="size-6 text-white" />
            영화 목록
          </Link>

          <div className="flex w-[800px] max-w-full flex-col gap-2">
            <h1 className="text-[30px]/[36px] font-bold tracking-[-1.2px] break-keep text-white sm:text-[46px]/[50px] sm:tracking-[-2.3px]">{movie.title}</h1>
            <p className="text-sm/[17px] text-white">{movie.original_title}</p>
            <p className="flex flex-wrap gap-2 text-[13px]/4 font-bold text-white">
              <span>{movie.release_date}</span>
              <span>{movie.genres.map((genre) => genre.name).join(" · ")}</span>
              <span>{formatRuntime(movie.runtime)}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start lg:px-20">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} 포스터`}
            className="h-[286px] w-[200px] shrink-0 rounded-[10px] object-cover shadow-[0_12px_30px_rgba(12,15,20,0.12)]"
          />
        ) : (
          <div className="flex h-[286px] w-[200px] shrink-0 items-center justify-center rounded-[10px] bg-line text-xs text-muted shadow-[0_12px_30px_rgba(12,15,20,0.12)]">
            이미지 없음
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h2 className="text-[21px]/[25px] font-bold tracking-[-0.63px] break-keep text-ink">{movie.tagline}</h2>
          <p className="text-sm/6 text-muted">{movie.overview}</p>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isFavoritePending}
            aria-pressed={isBookmarked}
            className={cn(
              "inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-white px-4 text-sm/[17px] font-extrabold whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50",
              isBookmarked ? "bg-ink" : "bg-brand",
            )}
          >
            <Icon
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              className="size-4 text-white"
            />
            {isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
          </button>
        </div>

        <MyRatingPanel key={movie.id} movieId={movie.id} />
      </div>
    </main>
  );
}