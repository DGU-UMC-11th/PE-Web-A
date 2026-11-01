import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";
import { BookmarkButton } from "../../components/movies/bookmark-button";
import { searchMovies } from "../../api/movies/search-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { MovieImage } from "../../components/movies/movie-image";
import { RequestState } from "../../components/movies/request-state";
import { Pagination } from "../../components/movies/pagination";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query, page } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const normalizedQuery = query?.trim() ?? "";
  const [searchResults, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let ignore = false;
    async function load() {
      setMovies([]);
      setError(null);
      setTotalResults(0);
      if (!normalizedQuery) { setLoading(false); return; }
      setLoading(true);
      try {
        const response = await searchMovies({ query: normalizedQuery, page });
        if (!ignore) {
          setMovies(response.results);
          setTotalPages(Math.min(response.total_pages, 500));
          setTotalResults(response.total_results);
        }
      } catch {
        if (!ignore) setError("검색 결과를 불러오지 못했어요.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, [normalizedQuery, page, attempt]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = String(new FormData(event.currentTarget).get("query") ?? "").trim();
    navigate({
      search: { query: nextQuery || undefined, page: 1 },
    });
  }

  return (
    <main className="mx-auto max-w-290 flex-1 px-6 py-10 pb-16">
      <h1 className="mb-7 text-2xl font-extrabold text-gray-900">영화 검색</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          aria-label="검색어"
          key={query ?? ""}
          name="query"
          defaultValue={query ?? ""}
          placeholder="영화 제목을 입력해 주세요"
          className="h-11 flex-1 rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
        >
          검색
        </button>
      </form>

      {!normalizedQuery ? (
        <p className="mt-10 text-sm text-gray-500">검색어를 입력해 주세요.</p>
      ) : (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">'{query}' 검색 결과</h2>
          <p className="mt-1 text-sm text-gray-500">영화 {totalResults}편</p>
          <RequestState loading={loading} error={error} empty={searchResults.length === 0} retry={() => setAttempt((value) => value + 1)} />
          {!loading && !error && searchResults.length > 0 && (
            <ul className="mt-6 flex flex-col gap-4">
              {searchResults.map((movie) => (
                <li key={movie.id} className="flex items-start gap-3">
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: String(movie.id) }}
                    className="flex min-w-0 flex-1 gap-5 rounded-xl p-2 hover:bg-gray-50"
                  >
                    <MovieImage
                      className="h-36 w-24 flex-none rounded-lg object-cover"
                      src={getTmdbPosterUrl(movie.poster_path)}
                      alt={`${movie.title} 포스터`}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900">{movie.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{movie.original_title}</p>
                      <p className="mt-1 text-[13px] text-gray-500">{movie.release_date}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                        {movie.overview}
                      </p>
                    </div>
                  </Link>
                  <BookmarkButton movieId={movie.id} className="mt-2 shrink-0" />
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && searchResults.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={(page) => { void navigate({ search: { query, page } }); }} />}
        </div>
      )}
    </main>
  );
}
