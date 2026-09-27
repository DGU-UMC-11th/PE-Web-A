/** 제공된 영화 10편은 한 페이지이므로 이전·다음 이동을 비활성화한다. */
export default function Pagination() {
  return (
    <nav className="pagination" aria-label="영화 목록 페이지">
      <button type="button" aria-label="이전 페이지" disabled><img src="/icons/chevron-left.svg" alt="" /></button>
      <span aria-current="page" aria-label="현재 페이지 1">1</span>
      <button type="button" aria-label="다음 페이지" disabled><img src="/icons/chevron-right.svg" alt="" /></button>
    </nav>
  );
}
