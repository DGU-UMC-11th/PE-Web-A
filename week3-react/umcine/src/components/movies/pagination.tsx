/** 제공된 10편은 한 페이지에 표시하므로 이전·다음은 비활성화한다. */
export function Pagination() {
  return <nav aria-label="영화 목록 페이지" className="mt-10 flex items-center justify-center gap-3">
    <button type="button" disabled aria-label="이전 페이지" className="grid size-8 place-items-center opacity-30"><img src="/icons/chevron-left.svg" alt="" className="size-4" /></button>
    <span aria-current="page" className="grid size-8 place-items-center text-sm font-bold text-[#4164ed]">1</span>
    <button type="button" disabled aria-label="다음 페이지" className="grid size-8 place-items-center opacity-30"><img src="/icons/chevron-right.svg" alt="" className="size-4" /></button>
  </nav>;
}
