import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { BookmarkButton } from "../../components/bookmark-button";
import { MovieImage } from "../../components/movies/movie-image";
import { StatusMessage } from "../../components/status-message";
import { formatRuntime } from "../../utils/movies/format-runtime";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);
  const isValidMovieId = Number.isInteger(parsedMovieId) && parsedMovieId > 0;

  const [movie, setMovie] = useState<TmdbMovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    setMovie(null);
    setErrorMessage(null);

    if (!isValidMovieId) {
      setIsLoading(false);
      return;
    }

    async function loadMovie() {
      setIsLoading(true);

      try {
        const response = await getMovieDetail(parsedMovieId);
        if (!ignore) setMovie(response);
      } catch (error) {
        if (!ignore) setErrorMessage(getMovieDetailErrorMessage(error));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadMovie();

    return () => {
      ignore = true;
    };
  }, [parsedMovieId, isValidMovieId]);

  if (!isValidMovieId) {
    return <StatusMessage message="올바르지 않은 영화 번호예요." tone="error" />;
  }

  if (isLoading) {
    return <StatusMessage message="영화 정보를 불러오는 중이에요." />;
  }

  if (errorMessage) {
    return <StatusMessage message={errorMessage} tone="error" />;
  }

  if (!movie) {
    return <StatusMessage message="영화를 찾을 수 없어요." tone="error" />;
  }

  return (
    <main>
      <div className="relative h-80 w-full">
        <MovieImage
          src={getTmdbBackdropUrl(movie.backdrop_path)}
          alt=""
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden="true" />
      </div>

      <div className="mx-auto -mt-32 flex max-w-5xl flex-col gap-8 px-8 sm:flex-row">
        <MovieImage
          src={getTmdbPosterUrl(movie.poster_path)}
          alt={`${movie.title} 포스터`}
          className="relative aspect-[2/3] w-48 shrink-0 rounded-lg shadow-lg"
        />
        <div className="relative flex flex-col gap-2 pt-4 sm:pt-36">
          <Link to="/" className="text-sm text-neutral-500 underline">
            ← 영화 목록
          </Link>
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-neutral-500">{movie.original_title}</p>
          <p>{movie.release_date || "개봉일 정보 없음"}</p>
          <p>{movie.genres.map((genre) => genre.name).join(", ") || "장르 정보 없음"}</p>
          <p>{formatRuntime(movie.runtime)}</p>
          {movie.tagline && <h2 className="mt-4 text-xl font-bold">{movie.tagline}</h2>}
          <p className="leading-relaxed">{movie.overview || "줄거리 정보가 없어요."}</p>
          <BookmarkButton movieId={movie.id} className="mt-2 self-start" />
        </div>
      </div>
    </main>
  );
}