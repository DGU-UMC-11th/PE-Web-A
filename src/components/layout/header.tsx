import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "../../utils/cn";

export default function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isMovieActive =
    pathname === "/" || pathname.startsWith("/movies/");

  const isSearchActive = pathname.startsWith("/search");

  const menuText =
    "text-[14px] font-bold leading-[20px] tracking-normal";

  return (
    <header className="w-full border-b border-[#e3e6eb] bg-white">
      <div className="mx-auto flex h-[96px] w-full max-w-[1440px] items-center justify-between px-[80px] py-[24px]">
        <div className="flex items-center">
          <div className="flex items-center gap-[14px]">
            <Link
              to="/"
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border-2 border-[#17191e] bg-white p-[6px]"
            >
              <img
                className="block h-[16px] w-[16px]"
                src="/icons/movie-icons/movie.svg"
                alt="UMCine 로고"
              />
            </Link>

            <h1 className="flex h-[24px] items-center text-[20px] font-black leading-[100%] tracking-[-0.7px] text-[#17191e]">
              UMCine
            </h1>
          </div>

          <nav className="ml-[48px] flex items-center gap-[32px]">
            <Link
              to="/"
              className={cn(
                "relative py-[8px] text-[#606774] no-underline hover:text-[#17191e]",
                menuText,
                isMovieActive &&
                  "text-[#17191e] after:absolute after:bottom-[4px] after:left-0 after:right-0 after:h-px after:bg-[#17191e]",
              )}
            >
              영화
            </Link>

            <Link
              to="/search"
              search={{}}
              className={cn(
                "relative py-[8px] text-[#606774] no-underline hover:text-[#17191e]",
                menuText,
                isSearchActive &&
                  "text-[#17191e] after:absolute after:bottom-[4px] after:left-0 after:right-0 after:h-px after:bg-[#17191e]",
              )}
            >
              검색
            </Link>

            <span
              className={cn(
                "cursor-pointer py-[8px] text-[#606774] hover:text-[#17191e]",
                menuText,
              )}
            >
              내 정보
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-[12px]">
          <Link
            to="/search"
            search={{}}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[8px] border-[1.5px] border-[#e3e6eb] bg-white"
          >
            <img
              className="h-[20px] w-[20px]"
              src="/icons/movie-icons/search.svg"
              alt="검색"
            />
          </Link>

          <button
            type="button"
            className="flex h-[42px] items-center justify-center rounded-[8px] border-0 bg-[#2563eb] px-[18px] hover:bg-[#1d4ed8] active:bg-[#1748ad]"
          >
            <span className={cn("text-white", menuText)}>
              로그인
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}