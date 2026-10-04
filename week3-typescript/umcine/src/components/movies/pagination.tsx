import { cn } from "../../utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="페이지 이동">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-transparent"
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg width="18" height="18" viewBox="32 128 24 24" fill="none" aria-hidden="true">
          <path
            d="M47.41 144.59L42.83 140L47.41 135.41L46 134L40 140L46 146L47.41 144.59Z"
            fill="currentColor"
          />
        </svg>
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100",
            page === currentPage && "bg-blue-600 font-bold text-white hover:bg-blue-600",
          )}
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-transparent"
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <svg width="18" height="18" viewBox="80 128 24 24" fill="none" aria-hidden="true">
          <path
            d="M88.59 144.59L93.17 140L88.59 135.41L90 134L96 140L90 146L88.59 144.59Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </nav>
  );
}
