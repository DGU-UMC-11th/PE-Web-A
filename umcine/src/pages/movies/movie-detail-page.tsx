
import {
  Link,
  useParams,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { isHTTPError } from "ky";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import {
  getTmdbPosterUrl,
  getTmdbBackdropUrl,
} from "../../utils/movies/tmdb-image";

function getMovieDetailErrorMessage(
  error: unknown
): string {
  if (
    isHTTPError(error) &&
    error.response.status === 404
  ) {
    return "영화를 찾을 수 없어요.";
  }

  return "영화 정보를 불러오지 못했어요.";
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({
    from: "/movies/$movieId",
  });

  const movieId = Number(movieIdParam);

  const isValidMovieId =
    Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  if (!isValidMovieId) {
    return (
      <main style={{ padding: "24px" }}>
        <p>올바르지 않은 영화 번호예요.</p>
        <Link to="/">영화 목록으로 돌아가기</Link>
      </main>
    );
  }

  if (movieDetailQuery.isPending) {
    return (
      <main style={{ padding: "24px" }}>
        <p>영화 상세 정보를 불러오는 중이에요.</p>
      </main>
    );
  }

  if (movieDetailQuery.isError) {
    return (
      <main style={{ padding: "24px" }}>
        <p>
          {getMovieDetailErrorMessage(
            movieDetailQuery.error
          )}
        </p>

        <button
          onClick={() => {
            void movieDetailQuery.refetch();
          }}
        >
          다시 시도
        </button>

        <p>
          <Link to="/">영화 목록으로 돌아가기</Link>
        </p>
      </main>
    );
  }

  const movie = movieDetailQuery.data;

  if (!movie) {
    return (
      <main style={{ padding: "24px" }}>
        <p>영화 정보가 없어요.</p>
        <Link to="/">영화 목록으로 돌아가기</Link>
      </main>
    );
  }

  const posterUrl = getTmdbPosterUrl(
    movie.poster_path
  );

  const backdropUrl = getTmdbBackdropUrl(
    movie.backdrop_path
  );

  const genres = movie.genres
    .map((genre) => genre.name)
    .join(", ");

  const runtime =
    movie.runtime !== null
      ? `${Math.floor(movie.runtime / 60)}시간 ${
          movie.runtime % 60
        }분`
      : "상영 시간 정보가 없어요.";

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "auto",
        padding: "24px",
      }}
    >
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/">영화 목록으로 돌아가기</Link>
      </nav>

      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={`${movie.title} 배경`}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "250px",
            backgroundColor: "#ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          이미지 없음
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: "240px" }}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${movie.title} 포스터`}
              style={{
                width: "100%",
                borderRadius: "8px",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
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
        </div>

        <section
          style={{
            flex: 1,
            minWidth: "250px",
          }}
        >
          <h1>{movie.title}</h1>

          <p>원제: {movie.original_title}</p>

          <p>
            개봉일:{" "}
            {movie.release_date || "정보 없음"}
          </p>

          <p>
            평점: {movie.vote_average.toFixed(1)}
          </p>

          <p>
            장르: {genres || "장르 정보 없음"}
          </p>

          <p>상영 시간: {runtime}</p>

          {movie.tagline && (
            <p>
              <strong>{movie.tagline}</strong>
            </p>
          )}

          <h2>줄거리</h2>

          <p>
            {movie.overview ||
              "줄거리 정보가 없어요."}
          </p>
        </section>
      </div>

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

export default MovieDetailPage;
  