
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "../../components/movies/pagination";
import { RetryButton } from "../../components/retry-button";
import { BookmarkButton } from "../../components/bookmark-button";
import { movieQueryOptions } from "../../api/movies/query-options";

export function SearchPage() {
  // URL에서 검색어와 페이지 번호 가져오기
  const { query = "", page = 1 } = useSearch({
    from: "/search",
  });

  const navigate = useNavigate({ from: "/search" });

  // 검색창 입력값
  const [searchText, setSearchText] = useState(query);

  // URL의 검색어가 변경되면 검색창도 변경
  useEffect(() => {
    setSearchText(query);
  }, [query]);

  const normalizedQuery = query.trim();

  // TanStack Query로 검색 요청
  const searchQuery = useQuery(movieQueryOptions.search({ query: normalizedQuery, page }));

  // 서버 응답 데이터
  const movies = searchQuery.data?.results ?? [];
  const totalPages = searchQuery.data?.total_pages ?? 0;
  const totalResults = searchQuery.data?.total_results ?? 0;

  // 검색 버튼 클릭
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchText.trim();

    void navigate({
      search: nextQuery
        ? { query: nextQuery, page: 1 }
        : {},
    });
  }

  // 검색어 지우기
  function handleClear() {
    setSearchText("");
  }

  // 페이지 변경
  function handlePageChange(nextPage: number) {
    void navigate({
      search: {
        query: normalizedQuery,
        page: nextPage,
      },
    });
  }

  return (
    <main className="flex-1 bg-[#f5f6f8]">
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
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
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
        <div className="flex flex-1 flex-col">
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
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-[#17191e] outline-none"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="mr-4 flex h-[24px] w-[24px] items-center justify-center text-[#606774]"
                    aria-label="검색어 지우기"
                  >
                    <span className="text-[24px] leading-none">
                      ×
                    </span>
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
                영화 {totalResults}편 · {page}페이지
              </p>
            </div>

            {/* API 요청 상태 처리 */}
            {searchQuery.isLoading ? (
              <p role="status">
                검색 결과를 불러오는 중이에요.
              </p>
            ) : searchQuery.isError ? (
              <div>
                <p role="alert">
                  {searchQuery.error.message}
                </p>

                <RetryButton
                  onRetry={() => {
                    void searchQuery.refetch();
                  }}
                />
              </div>
            ) : movies.length === 0 ? (
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
                {movies.map((movie) => (
                  <li
                    key={movie.id}
                    className="flex gap-[24px] border-b border-[#e1e4e8] py-6"
                  >
                    <div className="relative shrink-0">
                      <Link
                        to="/movies/$movieId"
                        params={{
                          movieId: String(movie.id),
                        }}
                      >
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={`${movie.title} 포스터`}
                            className="h-[190px] w-[126px] rounded-[12px] object-cover"
                          />
                        ) : (
                          <div className="flex h-[190px] w-[126px] items-center justify-center rounded-[12px] bg-gray-200">
                            포스터 없음
                          </div>
                        )}
                      </Link>

                      <BookmarkButton movieId={movie.id} />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to="/movies/$movieId"
                        params={{
                          movieId: String(movie.id),
                        }}
                        className="no-underline"
                      >
                        <h3 className="text-[18px] font-extrabold leading-[25px] text-[#17191e]">
                          {movie.title}
                        </h3>
                      </Link>

                      <div className="mt-[10px] flex items-center gap-[14px] text-[14px] leading-[20px] text-[#969da8]">
                        <span>{movie.original_title}</span>
                        <span>
                          {movie.release_date || "개봉일 미정"}
                        </span>
                      </div>

                      <p className="mt-[16px] line-clamp-2 text-[14px] leading-[22px] text-[#606774]">
                        {movie.overview}
                      </p>

                      <Link
                        to="/movies/$movieId"
                        params={{
                          movieId: String(movie.id),
                        }}
                        className="mt-[28px] text-[14px] font-bold leading-[20px] text-[#2563eb] no-underline"
                      >
                        상세 보기 →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* 검색 결과 페이지네이션 */}
            {searchQuery.isSuccess && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
