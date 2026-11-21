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
  // /my와 그 하위 경로(/my/edit)에서 활성
  const isMyActive = Boolean(matchRoute({ to: "/my", fuzzy: true }));

  return (
    <header className="w-full border-b border-line bg-white">
      <div className="mx-auto flex h-[91px] max-w-[1440px] items-center justify-between px-4 lg:px-20">
        <div className="flex items-center gap-4 sm:gap-[42px]">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink">
              <Icon name="movie" className="size-6 text-ink" />
            </span>
            <span className="hidden text-xl/6 font-black tracking-[-0.7px] text-ink sm:block">UMCine</span>
          </Link>

          <nav aria-label="주요 메뉴" className="flex items-center gap-3 text-sm/[17px] font-bold whitespace-nowrap sm:gap-[30px]">
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
            <Link
              to="/my"
              className={cn(
                navItemClassName,
                isMyActive ? activeNavItemClassName : inactiveNavItemClassName,
              )}
            >
              내 정보
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/search"
            aria-label="검색"
            className="flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-line bg-white"
          >
            <Icon name="search" className="size-6 text-muted" />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-[42px] min-w-[71px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white bg-brand px-4 text-sm/[17px] font-extrabold whitespace-nowrap text-white"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
