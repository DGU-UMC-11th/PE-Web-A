import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

/** 영화 정보와 부모가 관리하는 북마크 상태를 표시한다. */
export default function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="poster-wrap">
        <img className="movie-poster" src={movie.posterPath} alt={`${movie.title} 포스터`} />
        <button
          className={`bookmark-button${movie.isBookmarked ? ' is-bookmarked' : ''}`}
          type="button"
          aria-label={`${movie.title} 북마크`}
          aria-pressed={movie.isBookmarked}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img src={movie.isBookmarked ? '/icons/bookmark.svg' : '/icons/bookmark-outline.svg'} alt="" />
        </button>
      </div>
      <h2 title={movie.title}>{movie.title}</h2>
      <time dateTime={movie.releaseDate.replaceAll('.', '-')}>{movie.releaseDate}</time>
    </article>
  );
}
