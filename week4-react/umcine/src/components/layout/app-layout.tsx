import { Outlet } from '@tanstack/react-router';
import { Header } from './header';

/** 각 라우트에 공통 헤더와 푸터를 제공한다. */
export function AppLayout() {
  return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <Outlet />
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="mx-auto flex min-h-14 max-w-[1344px] items-center justify-end gap-2 px-8 py-3 text-[11px] text-gray-500">
            <img src="/images/logos/tmdb-logo.svg" alt="TMDB" className="w-6" />
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
        </footer>
      </div>
  );
}
