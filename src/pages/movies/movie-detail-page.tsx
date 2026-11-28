
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { RetryButton } from "../../components/retry-button";
import { movieQueryOptions } from "../../api/movies/query-options";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { BookmarkButton } from "../../components/bookmark-button";
import { MovieRating } from "./movie-rating";

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

          <BookmarkButton movieId={movieId} detail />
        </div>

        <MovieRating key={movieId} movieId={movieId} />
      </section>
    </main>
  );
}
