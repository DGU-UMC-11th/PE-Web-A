import { Link, useParams } from "@tanstack/react-router";
import { BookmarkButton } from "../../components/movies/bookmark-button";
import { useEffect, useState } from "react";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { MovieImage } from "../../components/movies/movie-image";
import { RequestState } from "../../components/movies/request-state";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);
  const valid = Number.isInteger(parsedMovieId) && parsedMovieId > 0;
  const [movie, setMovie] = useState<TmdbMovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let ignore = false;
    async function load() {
      setMovie(null);
      setError(null);
      if (!Number.isInteger(parsedMovieId) || parsedMovieId <= 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await getMovieDetail(parsedMovieId);
        if (!ignore) setMovie(response);
      } catch (error) {
        if (!ignore) setError(getMovieDetailErrorMessage(error));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, [parsedMovieId, attempt]);

  if (!valid || isLoading || error || !movie) {
    return <main className="mx-auto w-full max-w-290 flex-1 px-6 py-10">
      {!valid ? <p role="alert">올바르지 않은 영화 번호예요.</p> :
        <RequestState loading={isLoading} error={error} empty={!movie} retry={() => setAttempt((value) => value + 1)} />}
    </main>;
  }
  const runtime = movie.runtime === null ? "상영 시간 정보가 없어요." : `${Math.floor(movie.runtime / 60)}시간 ${movie.runtime % 60}분`;

  return (
    <main className="flex-1">
      <div className="relative h-90 w-full overflow-hidden">
        <MovieImage
          src={getTmdbBackdropUrl(movie.backdrop_path)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-white via-white/60 to-black/10" />
        <Link
          to="/" search={{ page: 1 }}
          className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-900 backdrop-blur hover:bg-white"
        >
          ← 영화 목록
        </Link>
      </div>

      <div className="mx-auto max-w-290 px-6">
        <div className="-mt-24 flex gap-6 pb-16">
          <MovieImage
            src={getTmdbPosterUrl(movie.poster_path)}
            alt={`${movie.title} 포스터`}
            className="h-67.5 w-45 flex-none rounded-xl object-cover shadow-lg"
          />
          <div className="flex-1 pt-28">
            <h1 className="text-2xl font-extrabold text-gray-900">{movie.title}</h1>
            <BookmarkButton movieId={movie.id} className="mt-3" />
            <p className="mt-1 text-sm text-gray-500">{movie.original_title}</p>
            <p className="mt-3 text-sm text-gray-500">
              {movie.release_date} · {movie.genres.map((genre) => genre.name).join(", ")} · {runtime}
            </p>
            <h2 className="mt-6 text-lg font-bold text-gray-900">{movie.tagline}</h2>
            <p className="mt-2 leading-relaxed text-gray-700">{movie.overview}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
