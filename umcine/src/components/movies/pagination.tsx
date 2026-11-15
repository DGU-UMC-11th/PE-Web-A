interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="pagination">
      <button
        className="page-btn"
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <img src="/icons/chevron-left.svg" alt="이전" />
      </button>
      <span className="page-number active">{currentPage}</span>
      <button
        className="page-btn"
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <img src="/icons/chevron-right.svg" alt="다음" />
      </button>
    </div>
  );
}