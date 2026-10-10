import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";
import { movies } from "../../data/movies";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query ?? "");

  useEffect(() => {
    setSearchText(query ?? "");
  }, [query]);

  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const searchResults = normalizedQuery
    ? movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle.toLowerCase().includes(normalizedQuery),
      )
    : [];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  return (
    <main className="mx-auto max-w-290 flex-1 px-6 py-10 pb-16">
      <h1 className="mb-7 text-2xl font-extrabold text-gray-900">영화 검색</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          aria-label="검색어"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
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
          <p className="mt-1 text-sm text-gray-500">영화 {searchResults.length}편</p>
          {searchResults.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">검색 결과가 없어요.</p>
          ) : (
            <ul className="mt-6 flex flex-col gap-4">
              {searchResults.map((movie) => (
                <li key={movie.id}>
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: String(movie.id) }}
                    className="flex gap-5 rounded-xl p-2 hover:bg-gray-50"
                  >
                    <img
                      className="h-36 w-24 flex-none rounded-lg object-cover"
                      src={movie.posterPath}
                      alt={`${movie.title} 포스터`}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900">{movie.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{movie.originalTitle}</p>
                      <p className="mt-1 text-[13px] text-gray-500">{movie.releaseDate}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                        {movie.overview}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
