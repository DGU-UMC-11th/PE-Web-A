import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { Icon } from "../../components/common/icon";
import { movies } from "../../data/movies";
import { useBookmarkStore } from "../../stores/bookmark-store";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

interface SearchResultItemProps {
  movie: Movie;
  hasDivider: boolean;
  isInLastRow: boolean;
}

/**
 * 검색 결과 한 항목. 북마크 상태는 Zustand store에서 읽고 바꾼다.
 * @param movie 표시할 영화 정보
 * @param hasDivider 아래 구분선을 그릴지 여부
 * @param isInLastRow lg 이상 2열 그리드의 마지막 행인지 여부
 */
function SearchResultItem({ movie, hasDivider, isInLastRow }: SearchResultItemProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movie.id),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <li
      className={cn(
        "flex gap-3 py-5 sm:gap-[18px]",
        hasDivider && "border-b border-line",
        isInLastRow && "lg:border-b-0",
      )}
    >
      <div className="relative shrink-0">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="h-[145px] w-24 shrink-0 rounded-[10px] bg-page object-cover sm:h-[190px] sm:w-[126px]"
        />
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
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-lg/6 font-bold break-keep text-ink">{movie.title}</h3>
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs/[14px] text-subtle">
          <span>{movie.originalTitle}</span>
          <span>{movie.releaseDate}</span>
        </p>
        <p className="line-clamp-3 text-[12.5px]/5 text-muted">{movie.overview}</p>
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          className="inline-flex items-center gap-1 self-start text-xs/[14px] font-extrabold text-brand"
        >
          상세 보기
          <Icon name="arrow-right" className="size-4 text-brand" />
        </Link>
      </div>
    </li>
  );
}

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query ?? "");
  const [prevQuery, setPrevQuery] = useState(query);

  // URL의 query가 바뀌면 입력창도 그 값으로 맞춘다.
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSearchText(query ?? "");
  }

  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const hasQuery = normalizedQuery !== "";
  const searchResults = hasQuery
    ? movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle.toLowerCase().includes(normalizedQuery),
      )
    : [];
  // lg 이상 2열 그리드의 마지막 행이 시작하는 index (마지막 행은 아래 구분선을 그리지 않는다)
  const lastRowStartIndex = searchResults.length - (searchResults.length % 2 || 2);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  function handleClear() {
    navigate({ search: {} });
  }

  if (!hasQuery) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-9 px-4 py-6">
        <h1 className="text-center text-[30px]/[38px] font-bold tracking-[-1.5px] break-keep text-ink sm:text-[46px]/[52px] sm:tracking-[-2.3px]">
          어떤 영화를 찾고 있나요?
        </h1>
        <div className="flex w-[790px] max-w-full flex-col gap-2">
          <form
            onSubmit={handleSubmit}
            className="flex h-[74px] w-full items-center gap-3.5 rounded-xl border-2 border-ink bg-white pr-[17px] pl-[21px] shadow-[0_12px_34px_rgba(17,19,24,0.08)]"
          >
            <Icon name="search" className="size-6 text-muted" />
            <input
              aria-label="검색어"
              placeholder="예: 스파이더맨"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[17px]/[20px] text-ink outline-none placeholder:text-subtle"
            />
            <button
              type="submit"
              className="h-[42px] w-[59px] shrink-0 cursor-pointer rounded-lg border border-ink bg-ink text-sm/[17px] font-extrabold whitespace-nowrap text-white"
            >
              검색
            </button>
          </form>
          <p className="text-xs text-subtle">검색어를 입력해 주세요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <div className="flex flex-col gap-[17px]">
        <h1 className="text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">영화 검색</h1>
        <form
          onSubmit={handleSubmit}
          className="flex h-[54px] w-full items-center gap-2.5 rounded-[9px] border border-line bg-white pr-2.5 pl-[15px] sm:gap-[18px]"
        >
          <Icon name="search" className="size-6 text-muted" />
          <input
            aria-label="검색어"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm/[17px] font-bold text-ink outline-none"
          />
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={handleClear}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center"
          >
            <Icon name="close" className="size-6 text-muted" />
          </button>
          <button
            type="submit"
            className="h-[42px] w-[86px] shrink-0 cursor-pointer rounded-lg border border-white bg-ink text-sm/[17px] font-extrabold whitespace-nowrap text-white"
          >
            다시 검색
          </button>
        </form>
      </div>

      <div className="mt-6 flex h-[54px] items-center justify-between gap-3 border-y border-line">
        <h2 className="min-w-0 truncate text-lg/[21px] font-bold text-ink">‘{query}’ 검색 결과</h2>
        <p className="shrink-0 text-xs/[14px] whitespace-nowrap text-subtle">영화 {searchResults.length}편 · 1페이지</p>
      </div>

      {searchResults.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">검색 결과가 없어요.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
          {searchResults.map((movie, index) => (
            <SearchResultItem
              key={movie.id}
              movie={movie}
              hasDivider={index < searchResults.length - 1}
              isInLastRow={index >= lastRowStartIndex}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
