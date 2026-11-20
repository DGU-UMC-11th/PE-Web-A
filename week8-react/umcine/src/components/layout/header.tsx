import { useAuthStore } from '../../stores/auth-store';
import { useMe } from '../../hooks/use-member';
import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '../../utils/cn';

/** 공개 페이지 사이를 이동하고 현재 화면에 해당하는 메뉴를 강조한다. */
export function Header() {
  const token = useAuthStore(state => state.accessToken);
  const me = useMe();
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
            <Link to="/my" className={cn(menuClass, 'text-[#606774]')}>내 정보</Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-[10px]">
          <Link to="/search" aria-label="영화 검색" className="flex size-[42px] items-center justify-center rounded-lg border border-[#e3e6eb] bg-white px-[6px] py-px">
            <span aria-hidden="true" className="size-6 bg-[#606774] mask-[url('/icons/search.svg')] mask-contain mask-center mask-no-repeat" />
          </Link>
          {!token ? <Link to="/login" className="rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-bold text-white">로그인</Link> : <>
            {me.isLoading ? <span role="status" aria-label="내 정보 불러오는 중" className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" /> : <Link to="/my" className="text-sm font-bold text-blue-700">{me.data?.nickname ? `${me.data.nickname}님` : '마이페이지'}</Link>}
            <button type="button" onClick={() => useAuthStore.getState().setAccessToken(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">로그아웃</button>
          </>}
        </div>
      </div>
    </header>
  );
}
