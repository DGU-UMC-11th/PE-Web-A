import { Link } from '@tanstack/react-router';
import type { Movie } from '../../types/movie';
import { cn } from '../../utils/cn';

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

/** 상세 링크와 독립적인 북마크 버튼을 표시한다. */
export function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article>
      <div className="relative overflow-hidden rounded-[10px]">
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} aria-label={`${movie.title} 상세 보기`}>
          <img src={movie.posterPath} alt={`${movie.title} 포스터`} className="aspect-[240/275] w-full object-cover transition-opacity hover:opacity-90" />
        </Link>
        <button type="button" aria-label={`${movie.title} 북마크`} aria-pressed={movie.isBookmarked}
          onClick={() => onToggleBookmark(movie.id)}
          className={cn('absolute right-2.5 top-2.5 grid size-[34px] place-items-center rounded-md border hover:ring-2 hover:ring-white/70',
            movie.isBookmarked ? 'border-[#4164ed] bg-[#4164ed]' : 'border-white/60 bg-black/70')}>
          <img src={movie.isBookmarked ? '/icons/bookmark.svg' : '/icons/bookmark-outline.svg'} alt="" className="size-[22px] brightness-0 invert" />
        </button>
      </div>
      <h2 className="mb-1 mt-2.5 truncate text-sm font-bold" title={movie.title}>
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>{movie.title}</Link>
      </h2>
      <time dateTime={movie.releaseDate.replaceAll('.', '-')} className="text-xs text-gray-500">{movie.releaseDate}</time>
    </article>
  );
}
