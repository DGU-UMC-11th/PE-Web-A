import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { searchMovies } from "../../api/movies/search-movies";
import { BookmarkButton } from "../../components/bookmark-button";
import { MovieImage } from "../../components/movies/movie-image";
import { StatusMessage } from "../../components/status-message";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query = "" } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query);

  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 뒤로 가기 등으로 주소의 query가 바뀌면 입력창도 맞춰요.
  useEffect(() => {
    setSearchText(query);
  }, [query]);

  // query가 바뀔 때마다 TMDB에 검색을 요청해요.
  useEffect(() => {
    let ignore = false;
    const normalizedQuery = query.trim();

    setMovies([]);
    setErrorMessage(null);

    if (!normalizedQuery) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    searchMovies({ query: normalizedQuery })
      .then((response) => {
        if (!ignore) setMovies(response.results);
      })
      .catch(() => {
        if (!ignore) setErrorMessage("검색 결과를 불러오지 못했어요.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  const normalizedQuery = query.trim();

  return (
    <main className="mx-auto max-w-5xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-bold">영화 검색</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          aria-label="검색어"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="영화 제목을 입력해 주세요"
          className="flex-1 rounded border border-neutral-300 px-4 py-2"
        />
        <button type="submit" className="rounded bg-neutral-900 px-5 py-2 font-bold text-white">
          검색
        </button>
      </form>

      {!normalizedQuery ? (
        <StatusMessage message="검색어를 입력해 주세요." />
      ) : isLoading ? (
        <StatusMessage message="검색 결과를 불러오는 중이에요." />
      ) : errorMessage ? (
        <StatusMessage message={errorMessage} tone="error" />
      ) : movies.length === 0 ? (
        <StatusMessage message="검색 결과가 없어요." />
      ) : (
        <>
          <h2 className="mb-1 text-xl font-bold">‘{normalizedQuery}’ 검색 결과</h2>
          <p className="mb-6 text-neutral-500">영화 {movies.length}편</p>
          <ul className="flex flex-col gap-6">
            {movies.map((movie) => (
              <li key={movie.id} className="flex gap-4">
                <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="shrink-0">
                  <MovieImage
                    src={getTmdbPosterUrl(movie.poster_path)}
                    alt={`${movie.title} 포스터`}
                    className="h-48 w-32 rounded"
                  />
                </Link>
                <div className="flex min-w-0 flex-col gap-1">
                  <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
                    <h3 className="text-lg font-bold">{movie.title}</h3>
                  </Link>
                  <p className="text-sm text-neutral-500">{movie.original_title}</p>
                  <p className="text-sm text-neutral-500">{movie.release_date || "개봉일 정보 없음"}</p>
                  <p className="line-clamp-3 text-sm">{movie.overview || "줄거리 정보가 없어요."}</p>
                  <BookmarkButton movieId={movie.id} className="mt-2 self-start" />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}