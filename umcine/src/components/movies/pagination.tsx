const arrowButtonClassName =
  "flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent p-0 disabled:cursor-default disabled:opacity-30";

/**
 * 이전/다음 버튼과 페이지 번호로 구성된 페이지네이션
 * 현재는 1페이지만 있어 이동 버튼은 비활성화되어 있다.
 */
function Pagination() {
  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="페이지 이동">
      <button type="button" className={arrowButtonClassName} aria-label="이전 페이지" disabled>
        <img src="/icons/chevron-left.svg" alt="" className="size-6" />
      </button>

      <button
        type="button"
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black p-0 text-base font-semibold text-white"
        aria-current="page"
      >
        1
      </button>

      <button type="button" className={arrowButtonClassName} aria-label="다음 페이지" disabled>
        <img src="/icons/chevron-right.svg" alt="" className="size-6" />
      </button>
    </nav>
  );
}

export default Pagination;
