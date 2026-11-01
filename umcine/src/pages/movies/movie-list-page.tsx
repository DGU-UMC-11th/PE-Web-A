
import { useEffect, useState } from "react";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function MovieListPage() {
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMovies({ page });

        if (!ignore) {
          setMovies(response.results);
          setTotalPages(response.total_pages);
        }
      } catch {
        if (!ignore) {
          setMovies([]);
          setErrorMessage("영화 목록을 불러오지 못했어요.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      ignore = true;
    };
  }, [page, retryCount]);

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "auto" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1>UMCine</h1>

        <nav style={{ display: "flex", gap: "20px" }}>
          <a href="/">인기 영화</a>
          <a href="/search">영화 검색</a>
        </nav>
      </header>

      <h2>인기 영화 목록</h2>

      {isLoading ? (
        <p>영화 목록을 불러오는 중이에요.</p>
      ) : errorMessage ? (
        <div>
          <p>{errorMessage}</p>
          <button onClick={() => setRetryCount((count) => count + 1)}>
            다시 시도
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p>조건에 맞는 영화가 없어요.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "20px",
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              marginTop: "30px",
            }}
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              이전
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}

      <footer style={{ marginTop: "50px", textAlign: "center" }}>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
        >
          TMDB
        </a>
        <p style={{ fontSize: "12px" }}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>
    </main>
  );
}

export default MovieListPage;
