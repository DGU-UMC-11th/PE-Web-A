import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '../../utils/cn';

/** 공개 페이지 사이를 이동하고 현재 화면에 해당하는 메뉴를 강조한다. */
export function Header() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isMoviePage = pathname === '/' || pathname.startsWith('/movies/');
  const isSearchPage = pathname === '/search';
  const menuClass = 'whitespace-nowrap text-sm leading-[17px] font-bold';

  return (
    <header className="bg-white font-[Pretendard,Arial,sans-serif] text-[#17191e]">
      <div className="mx-auto flex min-h-[91px] max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-6 lg:flex-nowrap lg:px-20">
        <div className="flex items-center gap-[42px]">
          <Link to="/" className="flex shrink-0 items-center gap-[10px]" aria-label="UMCine 홈">
            <span className="flex size-8 items-center justify-center rounded-lg border-2 border-[#17191e]">
              <img src="/icons/movie.svg" alt="" className="size-6" />
            </span>
            <span className="text-xl leading-6 font-black tracking-[-0.7px]">UMCine</span>
          </Link>
          <nav aria-label="주 메뉴" className="flex items-center gap-[30px]">
            <Link to="/" className={cn(menuClass, isMoviePage ? 'text-[#17191e] underline' : 'text-[#606774]')}>영화</Link>
            <Link to="/search" className={cn(menuClass, isSearchPage ? 'text-[#17191e] underline' : 'text-[#606774]')}>검색</Link>
            <button type="button" disabled title="준비 중" className={cn(menuClass, 'text-[#606774]')}>내 정보</button>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-[10px]">
          <Link to="/search" aria-label="영화 검색" className="flex size-[42px] items-center justify-center rounded-lg border border-[#e3e6eb] bg-white px-[6px] py-px">
            <span aria-hidden="true" className="size-6 bg-[#606774] mask-[url('/icons/search.svg')] mask-contain mask-center mask-no-repeat" />
          </Link>
          <button type="button" disabled title="준비 중" className="flex h-[42px] w-[71px] items-center justify-center rounded-lg border border-white bg-[#2563eb] px-4 text-sm leading-[17px] font-extrabold whitespace-nowrap text-white">로그인</button>
        </div>
      </div>
    </header>
  );
}
