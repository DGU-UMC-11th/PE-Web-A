import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-290 items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-1.5 text-xl font-bold text-gray-900">
            <svg
              className="text-blue-600"
              width="24"
              height="24"
              viewBox="128 128 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M146 132L148 136H145L143 132H141L143 136H140L138 132H136L138 136H135L133 132H132C130.9 132 130.01 132.9 130.01 134L130 146C130 147.1 130.9 148 132 148H148C149.1 148 150 147.1 150 146V132H146Z"
                fill="currentColor"
              />
            </svg>
            <span>UMCine</span>
          </Link>
          <nav className="flex items-center gap-7" aria-label="주요 메뉴">
            <Link
              to="/"
              className="text-[15px] font-medium text-gray-500"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[15px] font-bold text-gray-900" }}
            >
              영화
            </Link>
            <Link
              to="/search"
              className="text-[15px] font-medium text-gray-500"
              activeProps={{ className: "text-[15px] font-bold text-gray-900" }}
            >
              검색
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="검색"
          >
            <svg width="20" height="20" viewBox="80 80 24 24" fill="none" aria-hidden="true">
              <path
                d="M95.5 94H94.71L94.43 93.73C95.41 92.59 96 91.11 96 89.5C96 85.91 93.09 83 89.5 83C85.91 83 83 85.91 83 89.5C83 93.09 85.91 96 89.5 96C91.11 96 92.59 95.41 93.73 94.43L94 94.71V95.5L99 100.49L100.49 99L95.5 94ZM89.5 94C87.01 94 85 91.99 85 89.5C85 87.01 87.01 85 89.5 85C91.99 85 94 87.01 94 89.5C94 91.99 91.99 94 89.5 94Z"
                fill="currentColor"
              />
            </svg>
          </Link>
          <button
            type="button"
            className="h-9 rounded-lg bg-blue-600 px-4.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
