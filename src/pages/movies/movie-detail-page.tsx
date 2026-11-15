
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { RetryButton } from "../../components/retry-button";
import { movieQueryOptions } from "../../api/movies/query-options";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { useBookmarkStore } from "../../stores/bookmark-store";

export function MovieDetailPage() {
  // URL에서 영화 ID 가져오기
  const { movieId: movieIdParam } = useParams({
    from: "/movies/$movieId",
  });

  const movieId = Number(movieIdParam);
  const isValidMovieId =
    Number.isInteger(movieId) && movieId > 0;

  // 6주차: TanStack Query로 영화 상세 정보 요청
  const movieDetailQuery = useQuery(movieQueryOptions.detail(movieId));

  // 기존 평점과 후기 상태
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // 기존 Zustand 즐겨찾기 상태
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId)
  );

  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark
  );

  // 1. 유효하지 않은 영화 ID
  if (!isValidMovieId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-[#f5f6f8]">
        <p
          role="alert"
          className="text-[24px] font-bold text-[#17191e]"
        >
          올바르지 않은 영화 번호예요.
        </p>
      </main>
    );
  }

  // 2. 데이터 로딩
  if (movieDetailQuery.isPending) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-[#f5f6f8]">
        <p
          role="status"
          className="text-[24px] font-bold text-[#17191e]"
        >
          영화 정보를 불러오는 중이에요.
        </p>
      </main>
    );
  }

  // 3. API 요청 오류
  if (movieDetailQuery.isError) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f5f6f8]">
        <p
          role="alert"
          className="text-[24px] font-bold text-[#17191e]"
        >
          {getMovieDetailErrorMessage(movieDetailQuery.error)}
        </p>

        <RetryButton
          onRetry={() => {
            void movieDetailQuery.refetch();
          }}
        />
      </main>
    );
  }

  // 4. 요청 성공
  const movie = movieDetailQuery.data;

  const backdropPath =
    movie.backdrop_path ?? movie.poster_path;

  const runtime =
    typeof movie.runtime === "number"
      ? `${Math.floor(movie.runtime / 60)}시간 ${movie.runtime % 60}분`
      : "상영 시간 정보가 없어요.";

  return (
    <main className="flex flex-1 flex-col bg-[#f5f6f8]">
      {/* 영화 배경 및 기본 정보 */}
      <section
        className="relative h-[360px] w-full overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: backdropPath
            ? `url(https://image.tmdb.org/t/p/original${backdropPath})`
            : undefined,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-[32px] py-[28px]">
          <Link
            to="/"
            className="flex w-fit items-center gap-[8px] text-[14px] font-semibold text-white no-underline"
          >
            <span className="text-[24px] leading-none">
              ‹
            </span>
            영화 목록
          </Link>

          <div className="mt-auto mb-[24px]">
            <h1 className="text-[42px] font-extrabold leading-[52px] tracking-[-1.5px] text-white">
              {movie.title}
            </h1>

            <p className="mt-[12px] text-[14px] leading-[20px] text-white">
              {movie.original_title}
            </p>

            <div className="mt-[8px] flex items-center gap-[10px] text-[14px] font-semibold text-white">
              <span>
                {movie.release_date || "개봉일 미정"}
              </span>

              <span>
                {movie.genres
                  .map((genre) => genre.name)
                  .join(", ")}
              </span>

              <span>{runtime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 영화 상세 정보 영역 */}
      <section className="mx-auto flex w-full max-w-[1440px] flex-1 gap-[28px] px-[32px] py-[24px]">

        {/* 영화 포스터 */}
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={`${movie.title} 포스터`}
            className="h-[286px] w-[200px] shrink-0 rounded-[12px] object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-[286px] w-[200px] shrink-0 items-center justify-center rounded-[12px] bg-gray-200">
            포스터 없음
          </div>
        )}

        {/* 영화 설명 및 즐겨찾기 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-[20px] font-extrabold leading-[28px] text-[#17191e]">
            {movie.tagline}
          </h2>

          <p className="mt-[14px] text-[14px] leading-[22px] text-[#606774]">
            {movie.overview}
          </p>

          {/* Zustand 즐겨찾기 버튼 */}
          <button
            type="button"
            onClick={() => toggleBookmark(movieId)}
            aria-pressed={isBookmarked}
            aria-label={
              isBookmarked
                ? "즐겨찾기 해제"
                : "즐겨찾기 추가"
            }
            className="mt-4 inline-flex h-[42px] w-fit min-w-[120px] self-start items-center justify-center gap-2 rounded-[8px] px-4 text-[14px] font-bold text-white transition-colors"
            style={{
              backgroundColor: isBookmarked
                ? "#1d4ed8"
                : "#2563eb",
              color: "#ffffff",
            }}
          >
            <img
              src={
                isBookmarked
                  ? "/icons/movie-icons/bookmark.svg"
                  : "/icons/movie-icons/bookmark-outline.svg"
              }
              alt=""
              className="block h-[20px] w-[20px] shrink-0 brightness-0 invert"
            />

            <span className="whitespace-nowrap">
              {isBookmarked
                ? "즐겨찾기 "
                : "즐겨찾기"}
            </span>
          </button>
        </div>

        {/* 평점 및 후기 작성 */}
        <aside className="h-[294px] w-[360px] shrink-0 border-l border-[#d9dde3] pl-[28px]">
          <h2 className="text-[20px] font-extrabold leading-[28px] text-[#17191e]">
            내 평점
          </h2>

          <p className="mt-[4px] text-[12px] leading-[18px] text-[#969da8]">
            별점은 필수, 후기는 선택이에요.
          </p>

          {/* 별점 선택 */}
          <div className="mt-[12px] flex gap-[8px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`${star}점`}
                aria-pressed={rating === star}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-[8px] border border-[#d9dde3] bg-white text-[24px]"
              >
                <span
                  className={
                    star <= rating
                      ? "text-[#f7b500]"
                      : "text-[#606774]"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          {/* 후기 입력 */}
          <textarea
            value={review}
            onChange={(event) =>
              setReview(event.target.value)
            }
            placeholder="영화를 보고 느낀 점을 남겨보세요."
            className="mt-[12px] h-[100px] w-full resize-none rounded-[8px] border border-[#d9dde3] bg-white p-[14px] text-[13px] leading-[20px] text-[#17191e] outline-none placeholder:text-[#969da8]"
          />

          {/* 기존 UI 유지: 저장 기능은 별도 구현 필요 */}
          <button
            type="button"
            className="mt-[10px] h-[40px] w-full rounded-[7px] bg-[#17191e] text-[14px] font-bold text-white"
          >
            평점 저장
          </button>
        </aside>
      </section>
    </main>
  );
}
