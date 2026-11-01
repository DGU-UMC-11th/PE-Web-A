
import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { searchMovies } from "../../api/movies/search-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const search = useSearch({ strict: false });
  const query = typeof search.query === "string" ? search.query : "";

  const [inputValue, setInputValue] = useState(query);
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

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
        if (!ignore) {
          setMovies(response.results);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage("검색 결과를 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [query, retryCount]);

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "auto" }}>
      <h1>영화 검색</h1>

      <nav style={{ marginBottom: "24px" }}>
        <a href="/">인기 영화로 돌아가기</a>
      </nav>

      <form
        action="/search"
        method="get"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <input
          name="query"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
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

      {!query.trim() ? (
        <p>검색어를 입력해 주세요.</p>
      ) : isLoading ? (
        <p>영화를 검색하는 중이에요.</p>
      ) : errorMessage ? (
        <div>
          <p>{errorMessage}</p>
          <button onClick={() => setRetryCount((count) => count + 1)}>
            다시 시도
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p>검색 결과가 없어요.</p>
      ) : (
        <>
          <h2>"{query}" 검색 결과</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {movies.map((movie) => {
              const posterUrl = getTmdbPosterUrl(movie.poster_path);

              return (
                <a
                  key={movie.id}
                  href={`/movies/${movie.id}`}
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
                    <p>개봉일: {movie.release_date || "정보 없음"}</p>
                    <p>평점: {movie.vote_average.toFixed(1)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}

      <footer style={{ marginTop: "50px", textAlign: "center" }}>
        <a href="https://www.themoviedb.org/">TMDB</a>
        <p style={{ fontSize: "12px" }}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>
    </main>
  );
}

export default SearchPage;
