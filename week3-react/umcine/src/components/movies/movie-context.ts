import { createContext, useContext } from 'react';
import type { Movie } from '../../types/movie';

export const MovieContext = createContext<{
  movies: Movie[];
  toggleBookmark: (movieId: number) => void;
} | null>(null);

/** 공통 레이아웃에서 관리하는 영화와 북마크 변경 함수를 읽는다. */
export function useMovies() {
  const context = useContext(MovieContext);
  if (!context) throw new Error('MovieContext가 필요합니다.');
  return context;
}
