import { cn } from '../../utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** 현재 페이지 주변의 최대 다섯 페이지와 이전·다음 이동 버튼을 표시한다. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages < 1) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);
  return <nav aria-label="영화 목록 페이지" className="mt-10 flex items-center justify-center gap-3">
    <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="이전 페이지" className="grid size-8 place-items-center disabled:opacity-30"><img src="/icons/chevron-left.svg" alt="" className="size-4" /></button>
    {pages.map(number => <button key={number} type="button" onClick={() => onPageChange(number)} aria-label={`${number}페이지`} aria-current={page === number ? 'page' : undefined} className={cn('grid size-8 place-items-center rounded text-sm', page === number && 'bg-blue-50 font-bold text-[#4164ed]')}>{number}</button>)}
    <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="다음 페이지" className="grid size-8 place-items-center disabled:opacity-30"><img src="/icons/chevron-right.svg" alt="" className="size-4" /></button>
  </nav>;
}
