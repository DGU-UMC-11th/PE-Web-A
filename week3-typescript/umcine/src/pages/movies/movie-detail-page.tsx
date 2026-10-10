import { Link, useParams } from "@tanstack/react-router";
import { movies } from "../../data/movies";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));

  if (!movie) {
    return (
      <main className="mx-auto max-w-290 flex-1 px-6 py-10">영화를 찾을 수 없어요.</main>
    );
  }

  return (
    <main className="flex-1">
      <div className="relative h-90 w-full overflow-hidden">
        <img
          src={movie.backdropPath}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-white via-white/60 to-black/10" />
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-900 backdrop-blur hover:bg-white"
        >
          ← 영화 목록
        </Link>
      </div>

      <div className="mx-auto max-w-290 px-6">
        <div className="-mt-24 flex gap-6 pb-16">
          <img
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
            className="h-67.5 w-45 flex-none rounded-xl object-cover shadow-lg"
          />
          <div className="flex-1 pt-28">
            <h1 className="text-2xl font-extrabold text-gray-900">{movie.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{movie.originalTitle}</p>
            <p className="mt-3 text-sm text-gray-500">
              {movie.releaseDate} · {movie.genres.join(" · ")} · {movie.runtime}
            </p>
            <h2 className="mt-6 text-lg font-bold text-gray-900">{movie.tagline}</h2>
            <p className="mt-2 leading-relaxed text-gray-700">{movie.overview}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
