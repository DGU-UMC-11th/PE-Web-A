import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { Icon } from "../../components/common/icon";
import { useBookmarkStore } from "../../stores/bookmark-store";
import { cn } from "../../utils/cn";
import { formatRuntime } from "../../utils/movies/format-runtime";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";

const ratingScores = [1, 2, 3, 4, 5];

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);
  const isValidMovieId = Number.isInteger(parsedMovieId) && parsedMovieId > 0;

  const [movie, setMovie] = useState<TmdbMovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(isValidMovieId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prevMovieId, setPrevMovieId] = useState(parsedMovieId);

  // 영화 ID가 바뀌면 이전 상세 정보를 지우고 새 요청의 로딩을 시작한다.
  if (parsedMovieId !== prevMovieId) {
    setPrevMovieId(parsedMovieId);
    setMovie(null);
    setErrorMessage(null);
    setIsLoading(isValidMovieId);
  }

  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(parsedMovieId),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  useEffect(() => {
    if (!isValidMovieId) return;

    let ignore = false;

    getMovieDetail(parsedMovieId)
      .then((response) => {
        if (!ignore) setMovie(response);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getMovieDetailErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isValidMovieId, parsedMovieId]);

  if (!isValidMovieId) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        올바르지 않은 영화 번호예요.
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        영화 정보를 불러오는 중이에요.
      </main>
    );
  }

  if (errorMessage || !movie) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        {errorMessage ?? "영화 정보를 불러오지 못했어요."}
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
            onClick={() => toggleBookmark(movie.id)}
            aria-pressed={isBookmarked}
            className={cn(
              "inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-white px-4 text-sm/[17px] font-extrabold whitespace-nowrap text-white",
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

        <aside className="flex w-full shrink-0 flex-col gap-2 border-line pb-[41px] lg:w-[360px] lg:border-l lg:pl-[30px]">
          <h2 className="text-[21px]/[25px] font-bold tracking-[-0.63px] text-ink">내 평점</h2>
          <p className="text-xs/[14px] text-subtle">별점은 필수, 후기는 선택이에요.</p>
          <div className="flex gap-1">
            {ratingScores.map((score) => (
              <button
                key={score}
                type="button"
                aria-label={`${score}점`}
                className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white"
              >
                <Icon name="star" className="size-6 text-muted" />
              </button>
            ))}
          </div>
          <textarea
            aria-label="후기"
            placeholder="영화를 보고 느낀 점을 남겨보세요."
            className="h-[102px] w-full resize-none rounded-lg border border-line bg-white px-3 pt-4 pb-[18px] text-[13px]/5 text-ink placeholder:text-subtle"
          />
          <button
            type="button"
            className="h-[42px] w-full cursor-pointer rounded-lg border border-white bg-ink text-sm/[17px] font-extrabold text-white"
          >
            평점 저장
          </button>
        </aside>
      </div>
    </main>
  );
}