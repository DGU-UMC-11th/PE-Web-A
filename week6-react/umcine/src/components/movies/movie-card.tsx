import { MovieImage } from './movie-image';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';
import { Link } from '@tanstack/react-router';
import type { TmdbMovieListItem } from '../../api/movies/models';
import { BookmarkButton } from './bookmark-button';

interface MovieCardProps {
  movie: TmdbMovieListItem;
}

/** 상세 링크와 독립적인 북마크 버튼을 표시한다. */
export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article>
      <div className="relative overflow-hidden rounded-[10px]">
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} aria-label={`${movie.title} 상세 보기`}>
          <MovieImage src={getTmdbPosterUrl(movie.poster_path)} alt={`${movie.title} 포스터`} className="aspect-[240/275] w-full object-cover transition-opacity hover:opacity-90" />
        </Link>
        <BookmarkButton movieId={movie.id} title={movie.title} compact />
      </div>
      <h2 className="mb-1 mt-2.5 truncate text-sm font-bold" title={movie.title}>
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>{movie.title}</Link>
      </h2>
      <time dateTime={movie.release_date} className="text-xs text-gray-500">{movie.release_date || '개봉일 정보 없음'}</time>
    </article>
  );
}
