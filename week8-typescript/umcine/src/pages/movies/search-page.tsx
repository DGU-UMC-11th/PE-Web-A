import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../../queries/movies/movie-queries";
import { QueryFeedback } from "../../components/movies/query-feedback";
import { BookmarkButton } from "../../components/movies/bookmark-button";
import { MovieImage } from "../../components/movies/movie-image";
import { RequestState } from "../../components/movies/request-state";
import { Pagination } from "../../components/movies/pagination";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query, page } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const normalizedQuery = query?.trim() ?? "";
  const searchQuery = useQuery(movieQueries.search(normalizedQuery, page));
  const searchResults = searchQuery.data?.results ?? [];
  const totalPages = Math.min(searchQuery.data?.total_pages ?? 0, 500);
  const totalResults = searchQuery.data?.total_results ?? 0;
  const error = searchQuery.isError ? "검색 결과를 불러오지 못했어요." : null;
  const refetch = () => { void searchQuery.refetch(); };

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = String(new FormData(event.currentTarget).get("query") ?? "").trim();
    navigate({
      search: { query: nextQuery || undefined, page: 1 },
    });
  }

  return (
    <main className="mx-auto w-full max-w-290 flex-1 px-6 py-10 pb-16">
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
          <QueryFeedback isFetching={searchQuery.isFetching && !searchQuery.isPending}
            isPaused={searchQuery.isPaused} errorMessage={searchQuery.data ? error : null} refetch={refetch} />
          <RequestState loading={searchQuery.isLoading} error={searchQuery.data ? null : error}
            empty={searchQuery.isSuccess && searchResults.length === 0} retry={refetch} />
          {searchQuery.data && searchResults.length > 0 && (
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
          {searchQuery.data && searchResults.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={(page) => { void navigate({ search: { query, page } }); }} />}
        </div>
      )}
    </main>
  );
}
