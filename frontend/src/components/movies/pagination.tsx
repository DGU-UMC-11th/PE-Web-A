import "./pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const lastPage = Math.min(totalPages, 500);
  if (lastPage <= 1) return null;
  const startPage = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
  const pages = Array.from(
    { length: Math.min(5, lastPage - startPage + 1) },
    (_, index) => startPage + index,
  );

  return (
    <nav className="pagination" aria-label="영화 페이지">
      <button type="button" className="page-button" disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}>이전</button>
      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={`page-button ${
            currentPage === page ? "active" : ""
          }`}
          aria-current={currentPage === page ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button type="button" className="page-button" disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}>다음</button>
    </nav>
  );
}
