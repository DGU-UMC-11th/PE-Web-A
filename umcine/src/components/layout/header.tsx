import { Link, useMatchRoute } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import { Icon } from "../common/icon";

const navItemClassName = "underline-offset-4";
const activeNavItemClassName = "text-ink underline";
const inactiveNavItemClassName = "text-muted";

/**
 * 로고, 내비게이션 메뉴, 검색 버튼, 로그인 버튼을 보여주는 상단 헤더
 */
export function Header() {
  const matchRoute = useMatchRoute();
  const isMoviesActive =
    Boolean(matchRoute({ to: "/" })) || Boolean(matchRoute({ to: "/movies/$movieId" }));
  const isSearchActive = Boolean(matchRoute({ to: "/search" }));

  return (
    <header className="w-full border-b border-line bg-white">
      <div className="mx-auto flex h-[91px] max-w-[1440px] items-center justify-between px-4 lg:px-20">
        <div className="flex items-center gap-[42px]">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink">
              <Icon name="movie" className="size-6 text-ink" />
            </span>
            <span className="text-xl/6 font-black tracking-[-0.7px] text-ink">UMCine</span>
          </Link>

          <nav aria-label="주요 메뉴" className="flex items-center gap-[30px] text-sm/[17px] font-bold">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={cn(
                navItemClassName,
                isMoviesActive ? activeNavItemClassName : inactiveNavItemClassName,
              )}
            >
              영화
            </Link>
            <Link
              to="/search"
              className={cn(
                navItemClassName,
                isSearchActive ? activeNavItemClassName : inactiveNavItemClassName,
              )}
            >
              검색
            </Link>
            {/* /my 경로가 아직 없어 비활성 메뉴로 둔다. */}
            <span
              aria-disabled="true"
              className={cn(navItemClassName, inactiveNavItemClassName, "cursor-not-allowed")}
            >
              내 정보
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/search"
            aria-label="검색"
            className="flex size-[42px] items-center justify-center rounded-lg border border-line bg-white"
          >
            <Icon name="search" className="size-6 text-muted" />
          </Link>
          <button
            type="button"
            className="h-[42px] min-w-[71px] cursor-pointer rounded-lg border border-white bg-brand px-4 text-sm/[17px] font-extrabold text-white"
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
