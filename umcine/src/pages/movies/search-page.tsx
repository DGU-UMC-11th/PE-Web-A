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
    <main className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">영화 검색</h1>

      {/* 검색 입력 폼 (가로로 긴 input과 검은색 버튼) */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          aria-label="검색어"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium"
        >
          검색
        </button>
      </form>

      {/* 상황별 안내 문구 및 결과 리스트 */}
      {!normalizedQuery ? (
        <p className="text-xs text-gray-500">검색어를 입력해 주세요.</p>
      ) : searchResults.length === 0 ? (
        <p className="text-xs text-gray-500">검색 결과가 없어요.</p>
      ) : (
        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-4">
            '{query}' 검색 결과 ({searchResults.length}개)
          </p>
          <ul className="flex flex-col gap-4">
            {searchResults.map((movie) => (
              <li
                key={movie.id}
                className="flex gap-4 border p-3 rounded bg-white"
              >
                <img
                  src={movie.posterPath}
                  alt={`${movie.title} 포스터`}
                  className="w-20 rounded object-cover"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{movie.title}</h3>
                    <p className="text-xs text-gray-500">{movie.originalTitle}</p>
                    <p className="text-xs text-gray-400 mt-1">{movie.releaseDate}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {movie.overview}
                    </p>
                  </div>
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: String(movie.id) }}
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    상세 보기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}