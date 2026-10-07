import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import Footer from "../../components/footer";
import { movies } from "../../data/movies";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });

  const movie = movies.find((movie) => movie.id === Number(movieId));

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(
    movie?.isBookmarked ?? false,
  );

  if (!movie) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
        <p className="text-[24px] font-bold text-[#17191e]">
          영화를 찾을 수 없어요.
        </p>
      </main>
    );
  }

  const backdropPath = movie.backdropPath ?? movie.posterPath;

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f6f8]">
      <section
        className="relative h-[360px] w-full overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${backdropPath})`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-[32px] py-[28px]">
          <Link
            to="/"
            className="flex w-fit items-center gap-[8px] text-[14px] font-semibold text-white no-underline"
          >
            <span className="text-[24px] leading-none">‹</span>
            영화 목록
          </Link>

          <div className="mt-auto mb-[24px]">
            <h1 className="text-[42px] font-extrabold leading-[52px] tracking-[-1.5px] text-white">
              {movie.title}
            </h1>

            <p className="mt-[12px] text-[14px] leading-[20px] text-white">
              {movie.originalTitle}
            </p>

            <div className="mt-[8px] flex items-center gap-[10px] text-[14px] font-semibold text-white">
              <span>{movie.releaseDate}</span>
              <span>{movie.genres.join(" · ")}</span>
              <span>{movie.runtime}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-1 gap-[28px] px-[32px] py-[24px]">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="h-[286px] w-[200px] shrink-0 rounded-[12px] object-cover shadow-sm"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-[20px] font-extrabold leading-[28px] text-[#17191e]">
            {movie.tagline}
          </h2>

          <p className="mt-[14px] text-[14px] leading-[22px] text-[#606774]">
            {movie.overview}
          </p>

          <button
            type="button"
            onClick={() => setIsBookmarked((current) => !current)}
            className="mt-[16px] flex h-[42px] w-[106px] items-center justify-center gap-[8px] rounded-[8px] bg-[#2563eb] text-[14px] font-bold text-white"
          >
            <img
              src={
                isBookmarked
                  ? "/icons/movie-icons/bookmark.svg"
                  : "/icons/movie-icons/bookmark-outline.svg"
              }
              alt=""
              className="h-[20px] w-[20px] brightness-0 invert"
            />

            즐겨찾기
          </button>
        </div>

        <aside className="h-[294px] w-[360px] shrink-0 border-l border-[#d9dde3] pl-[28px]">
          <h2 className="text-[20px] font-extrabold leading-[28px] text-[#17191e]">
            내 평점
          </h2>

          <p className="mt-[4px] text-[12px] leading-[18px] text-[#969da8]">
            별점은 필수, 후기는 선택이에요.
          </p>

          <div className="mt-[12px] flex gap-[8px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-[8px] border border-[#d9dde3] bg-white text-[24px]"
              >
                <span
                  className={
                    star <= rating ? "text-[#f7b500]" : "text-[#606774]"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            placeholder="영화를 보고 느낀 점을 남겨보세요."
            className="mt-[12px] h-[100px] w-full resize-none rounded-[8px] border border-[#d9dde3] bg-white p-[14px] text-[13px] leading-[20px] text-[#17191e] outline-none placeholder:text-[#969da8]"
          />

          <button
            type="button"
            className="mt-[10px] h-[40px] w-full rounded-[7px] bg-[#17191e] text-[14px] font-bold text-white"
          >
            평점 저장
          </button>
        </aside>
      </section>

      <Footer />
    </main>
  );
}