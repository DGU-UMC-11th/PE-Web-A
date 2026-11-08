
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies/search-movies";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const normalizedQuery = query?.trim() ?? "";

  const navigate = useNavigate({ from: "/search" });

  const [inputValue, setInputValue] = useState(
    normalizedQuery
  );

  useEffect(() => {
    setInputValue(normalizedQuery);
  }, [normalizedQuery]);

  const searchQuery = useQuery({
    queryKey: [
      "movies",
      "search",
      { query: normalizedQuery },
    ],
    queryFn: () =>
      searchMovies({ query: normalizedQuery }),
    enabled: normalizedQuery.length > 0,
  });

  const searchResults = searchQuery.data?.results ?? [];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    void navigate({
      to: "/search",
      search: { query: inputValue.trim() },
    });
  };

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h1>영화 검색</h1>

      <nav style={{ marginBottom: "24px" }}>
        <Link to="/">인기 영화로 돌아가기</Link>
      </nav>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <input
          name="query"
          value={inputValue}
          onChange={(event) =>
            setInputValue(event.target.value)
          }
          placeholder="영화 제목을 입력하세요."
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #aaa",
            borderRadius: "6px",
          }}
        />

        <button type="submit">검색</button>
      </form>

      {!normalizedQuery ? (
        <p>검색어를 입력해 주세요.</p>
      ) : searchQuery.isLoading ? (
        <p>검색 결과를 불러오는 중이에요.</p>
      ) : searchQuery.isError ? (
        <div>
          <p>{searchQuery.error.message}</p>
          <button
            onClick={() => {
              void searchQuery.refetch();
            }}
          >
            다시 시도
          </button>
        </div>
      ) : searchQuery.isSuccess &&
        searchResults.length === 0 ? (
        <p>검색 결과가 없어요.</p>
      ) : (
        <>
          <h2>"{normalizedQuery}" 검색 결과</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {searchResults.map((movie) => {
              const posterUrl = getTmdbPosterUrl(
                movie.poster_path
              );

              return (
                <Link
                  key={movie.id}
                  to="/movies/$movieId"
                  params={{ movieId: String(movie.id) }}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`${movie.title} 포스터`}
                      style={{
                        width: "100%",
                        aspectRatio: "2 / 3",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        aspectRatio: "2 / 3",
                        backgroundColor: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      이미지 없음
                    </div>
                  )}

                  <div style={{ padding: "12px" }}>
                    <h3>{movie.title}</h3>
                    <p>
                      개봉일:{" "}
                      {movie.release_date || "정보 없음"}
                    </p>
                    <p>
                      평점: {movie.vote_average.toFixed(1)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <footer
        style={{
          marginTop: "50px",
          textAlign: "center",
        }}
      >
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
        >
          TMDB
        </a>

        <p style={{ fontSize: "12px" }}>
          This product uses the TMDB API but is
          not endorsed or certified by TMDB.
        </p>
      </footer>
    </main>
  );
}

export default SearchPage;
