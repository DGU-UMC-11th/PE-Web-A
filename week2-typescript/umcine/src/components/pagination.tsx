import "./pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="pagination__arrow"
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
          className={
            page === currentPage
              ? "pagination__page pagination__page--active"
              : "pagination__page"
          }
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="pagination__arrow"
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
