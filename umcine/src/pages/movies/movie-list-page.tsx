
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovies } from "../../api/movies/get-movies";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function MovieListPage() {
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1>UMCine</h1>

        <nav style={{ display: "flex", gap: "20px" }}>
          <Link to="/">인기 영화</Link>
          <Link to="/search" search={{ query: "" }}>
            영화 검색
          </Link>
        </nav>
      </header>

      <h2>인기 영화 목록</h2>

      {moviesQuery.isPending ? (
        <p>영화 목록을 불러오는 중이에요.</p>
      ) : moviesQuery.isError ? (
        <div>
          <p>{moviesQuery.error.message}</p>
          <button
            onClick={() => {
              void moviesQuery.refetch();
            }}
          >
            다시 시도
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p>표시할 영화가 없어요.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {movies.map((movie) => {
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
              onClick={() =>
                handlePageChange(Math.max(1, page - 1))
              }
            >
              이전
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() =>
                handlePageChange(page + 1)
              }
            >
              다음
            </button>
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

export default MovieListPage;
