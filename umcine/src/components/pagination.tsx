export default function Pagination() {
    return (
      <div className="pagination">
        <button className="page-btn" disabled type="button">
          <img src="/icons/chevron-left.svg" alt="이전" />
        </button>
        <span className="page-number active">1</span>
        <button className="page-btn" type="button">
          <img src="/icons/chevron-right.svg" alt="다음" />
        </button>
      </div>
    );
  }