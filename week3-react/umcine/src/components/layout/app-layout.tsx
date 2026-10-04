import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Header } from './header';
import { MovieContext } from '../movies/movie-context';
import { movies as initialMovies } from '../../data/movies';

/** 페이지 이동 중에도 영화 상태와 공통 헤더·푸터를 유지한다. */
export function AppLayout() {
  const [movies, setMovies] = useState(initialMovies);

  /** 지정한 영화만 새 객체로 교체하여 북마크를 반전한다. @param movieId 영화 ID */
  function toggleBookmark(movieId: number) {
    setMovies(current => current.map(movie => movie.id === movieId
      ? { ...movie, isBookmarked: !movie.isBookmarked } : movie));
  }

  return (
    <MovieContext.Provider value={{ movies, toggleBookmark }}>
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
    </MovieContext.Provider>
  );
}
