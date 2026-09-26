import "./pagination.css";

function Pagination() {
  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button type="button" className="pagination__arrow-button" aria-label="이전 페이지" disabled>
        <img src="/icons/chevron-left.svg" alt="" className="pagination__arrow-icon" />
      </button>

      <button
        type="button"
        className="pagination__page-button pagination__page-button--active"
        aria-current="page"
      >
        1
      </button>

      <button type="button" className="pagination__arrow-button" aria-label="다음 페이지" disabled>
        <img src="/icons/chevron-right.svg" alt="" className="pagination__arrow-icon" />
      </button>
    </nav>
  );
}

export default Pagination;
