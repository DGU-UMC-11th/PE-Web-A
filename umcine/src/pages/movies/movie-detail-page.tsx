import { Link, useParams } from "@tanstack/react-router";
import { BookmarkButton } from "../../components/bookmark-button"; 
import { movies } from "../../data/movies";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));

  if (!movie) {
    return <main className="p-6">영화를 찾을 수 없어요.</main>;
  }

  return (
    <main>
      {/* 상단 배경 포스터 영역 */}
      <div className="relative h-64 w-full bg-black">
        {movie.backdropPath && (
          <img
            src={movie.backdropPath}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-60"
          />
        )}
        <div className="absolute bottom-4 left-6 text-white">
          <Link to="/" className="text-xs text-gray-300 hover:underline">
            영화 목록
          </Link>
          <h1 className="text-2xl font-bold mt-1">{movie.title}</h1>
          <p className="text-xs text-gray-300 mt-1">{movie.originalTitle}</p>
          <p className="text-xs text-gray-400">
            {movie.releaseDate} · {movie.genres.join(", ")} · {movie.runtime}분
          </p>
          <BookmarkButton movieId={movie.id} className="mt-3" /> {}
        </div>
      </div>

      {/* 하단 포스터와 상세 내용 */}
      <div className="p-6 flex gap-6 max-w-4xl">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="w-40 rounded shadow-md object-cover self-start"
        />
        <div>
          <h2 className="text-base font-bold text-gray-900">{movie.tagline}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {movie.overview}
          </p>
        </div>
      </div>
    </main>
  );
}