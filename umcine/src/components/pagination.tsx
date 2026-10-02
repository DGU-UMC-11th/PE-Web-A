import "./pagination.css";

/**
 * 이전/다음 버튼과 페이지 번호로 구성된 페이지네이션
 * 현재는 1페이지만 있어 이동 버튼은 비활성화되어 있다.
 */
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
