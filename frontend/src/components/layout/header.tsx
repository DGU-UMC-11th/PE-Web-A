"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { cn } from "../../utils/cn";

export default function Header() {
  return (
    <Suspense fallback={<HeaderContent pathname="" />}>
      <ActiveHeader />
    </Suspense>
  );
}

function ActiveHeader() {
  return <HeaderContent pathname={usePathname()} />;
}

function HeaderContent({ pathname }: { pathname: string }) {
  const isMovieActive =
    pathname === "/" || pathname.startsWith("/movies/");

  const isProfileActive = pathname.startsWith("/mypage");

  const isSearchActive = pathname.startsWith("/search");

  const menuText =
    "text-[14px] font-bold leading-[20px] tracking-normal";

  return (
    <header className="w-full border-b border-[#e3e6eb] bg-white">
      <div className="mx-auto flex h-[96px] w-full max-w-[1440px] items-center justify-between px-6 py-[24px] md:px-[80px]">
        <div className="flex items-center">
          <div className="flex items-center gap-[14px]">
            <Link
              href="/"
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

          <nav className="ml-5 flex items-center gap-4 md:ml-[48px] md:gap-[32px]">
            <Link
              href="/"
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
              href="/search"
              className={cn(
                "relative py-[8px] text-[#606774] no-underline hover:text-[#17191e]",
                menuText,
                isSearchActive &&
                  "text-[#17191e] after:absolute after:bottom-[4px] after:left-0 after:right-0 after:h-px after:bg-[#17191e]",
              )}
            >
              검색
            </Link>

            <Link
              href="/mypage"
              className={cn(
                "relative py-[8px] text-[#606774] hover:text-[#17191e]",
                isProfileActive && "text-[#17191e] after:absolute after:bottom-[4px] after:left-0 after:right-0 after:h-px after:bg-[#17191e]",
                menuText,
              )}
            >
              내 정보
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-[12px]">
          <Link
            href="/search"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[8px] border-[1.5px] border-[#e3e6eb] bg-white"
          >
            <img
              className="h-[20px] w-[20px]"
              src="/icons/movie-icons/search.svg"
              alt="검색"
            />
          </Link>

          <Link
            href="/login"
            className="flex h-[42px] items-center justify-center rounded-[8px] border-0 bg-[#2563eb] px-[18px] hover:bg-[#1d4ed8] active:bg-[#1748ad]"
          >
            <span className={cn("text-white", menuText)}>
              로그인
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}