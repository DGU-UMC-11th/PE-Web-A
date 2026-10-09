import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";

import Footer from "../../components/footer";
import { BookmarkButton } from "../../components/bookmark-button";
import { movies } from "../../data/movies";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });

  const [searchText, setSearchText] = useState(query ?? "");

  useEffect(() => {
    setSearchText(query ?? "");
  }, [query]);

  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  const searchResults = normalizedQuery
    ? movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle.toLowerCase().includes(normalizedQuery),
      )
    : [];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchText.trim();

    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  function handleClear() {
    setSearchText("");
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {!normalizedQuery ? (
        <section className="flex min-h-[520px] items-center justify-center px-6">
          <div className="flex h-[163px] w-[790px] max-w-full flex-col justify-between">
            <h1 className="text-center text-[44px] font-extrabold leading-[53px] tracking-[-1.3px] text-[#17191e]">
              어떤 영화를 찾고 있나요?
            </h1>

            <form
              onSubmit={handleSubmit}
              className="flex h-[74px] w-full items-center rounded-[14px] border-2 border-[#17191e] bg-white px-[24px]"
            >
              <img
                src="/icons/movie-icons/search.svg"
                alt=""
                className="mr-4 h-[24px] w-[24px] shrink-0 opacity-80"
              />

              <input
                aria-label="검색어"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="예: 스파이더맨"
                className="min-w-0 flex-1 bg-transparent text-[18px] text-[#17191e] outline-none placeholder:text-[#969da8]"
              />

              <button
                type="submit"
                className="ml-4 h-[42px] w-[59px] shrink-0 rounded-[9px] bg-[#17191e] text-[14px] font-bold text-white"
              >
                검색
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="flex min-h-screen flex-col">
          <section className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-6 py-8">
            <div className="mb-4 flex h-[115px] w-full flex-col justify-between">
              <h1 className="h-[44px] text-[32px] font-extrabold leading-[44px] tracking-[-1px] text-[#17191e]">
                영화 검색
              </h1>

              <form
                onSubmit={handleSubmit}
                className="flex h-[54px] w-full items-center rounded-[12px] border border-[#d9dde3] bg-white px-4"
              >
                <img
                  src="/icons/movie-icons/search.svg"
                  alt=""
                  className="mr-4 h-[24px] w-[24px] shrink-0 opacity-80"
                />

                <input
                  aria-label="검색어"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-[#17191e] outline-none"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="mr-4 flex h-[24px] w-[24px] items-center justify-center text-[#606774]"
                    aria-label="검색어 지우기"
                  >
                    <span className="text-[24px] leading-none">×</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="flex h-[42px] shrink-0 items-center justify-center rounded-[9px] bg-[#17191e] px-[18px] text-[14px] font-bold leading-[17px] text-white"
                >
                  다시 검색
                </button>
              </form>
            </div>

            <div className="mb-4 flex items-center justify-between border-b border-[#e1e4e8] pb-4">
              <h2 className="text-[16px] font-bold text-[#17191e]">
                ‘{query}’ 검색 결과
              </h2>

              <p className="text-[12px] text-[#969da8]">
                영화 {searchResults.length}편 · 1페이지
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[18px] font-semibold text-[#17191e]">
                  검색 결과가 없어요.
                </p>

                <p className="mt-2 text-[14px] text-[#969da8]">
                  다른 검색어로 다시 검색해 주세요.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-x-9 md:grid-cols-2">
                {searchResults.map((movie) => (
                  <li
                    key={movie.id}
                    className="flex gap-[24px] border-b border-[#e1e4e8] py-6"
                  >
                    <div className="relative shrink-0">
                      <Link
                        to="/movies/$movieId"
                        params={{ movieId: String(movie.id) }}
                      >
                        <img
                          src={movie.posterPath}
                          alt={`${movie.title} 포스터`}
                          className="h-[190px] w-[126px] rounded-[12px] object-cover"
                        />
                      </Link>
                      <BookmarkButton movieId={movie.id} />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to="/movies/$movieId"
                        params={{ movieId: String(movie.id) }}
                        className="no-underline"
                      >
                        <h3 className="text-[18px] font-extrabold leading-[25px] text-[#17191e]">
                          {movie.title}
                        </h3>
                      </Link>

                      <div className="mt-[10px] flex items-center gap-[14px] text-[14px] leading-[20px] text-[#969da8]">
                        <span>{movie.originalTitle}</span>
                        <span>{movie.releaseDate}</span>
                      </div>

                      <p className="mt-[16px] line-clamp-2 text-[14px] leading-[22px] text-[#606774]">
                        {movie.overview}
                      </p>

                      <Link
                        to="/movies/$movieId"
                        params={{ movieId: String(movie.id) }}
                        className="mt-[28px] text-[14px] font-bold leading-[20px] text-[#2563eb] no-underline"
                      >
                        상세 보기 →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Footer />
        </div>
      )}
    </main>
  );
}
