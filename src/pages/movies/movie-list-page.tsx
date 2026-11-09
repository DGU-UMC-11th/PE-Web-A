
import "../../App.css";
import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { RetryButton } from "../../components/retry-button";

import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { useBookmarkStore } from "../../stores/bookmark-store";

// 새로 추가한 import
import { getMovies } from "../../api/movies/get-movies";
import { toMovieListItem } from "../../api/movies/adapters";
import type { MovieListItem } from "../../types/movie";

const GRID_COLUMNS_KEY = "umcine-grid-columns";

export function MovieListPage() {
  const { page = 1 } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [totalPages, setTotalPages] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const storageMode = useBookmarkStore((state) => state.storageMode);
  const setStorageMode = useBookmarkStore((state) => state.setStorageMode);

  const [columns, setColumns] = useState<3 | 5>(() => {
    try {
      return localStorage.getItem(GRID_COLUMNS_KEY) === "3" ? 3 : 5;
    } catch {
      return 5;
    }
  });

  // API 영화 데이터 및 요청 상태
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 페이지 변경 또는 재시도 시 요청한다.
  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      setIsLoading(true);
      setErrorMessage(null);
      setMovies([]);
      setTotalPages(0);

      try {
        const response = await getMovies({ page });

        if (!ignore) {
          setMovies(response.results.map(toMovieListItem));
          setTotalPages(response.total_pages);
        }
      } catch {
        if (!ignore) {
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
    <>
      <main className="main-content">
        <h1 className="page-title">영화 목록</h1>

        <label className="mb-4 flex items-center gap-2 text-sm text-[#606774]">
          북마크 저장
          <select
            value={storageMode}
            onChange={(event) =>
              setStorageMode(event.target.value === "session" ? "session" : "local")
            }
            className="rounded border border-[#d9dde3] bg-white px-2 py-1"
          >
            <option value="local">계속 저장 (기본)</option>
            <option value="session">현재 탭만 저장</option>
          </select>
        </label>

        <p className="mb-4 text-xs text-[#606774]">
          {storageMode === "local"
            ? "브라우저를 닫아도 북마크가 유지돼요."
            : "현재 북마크는 이 탭으로 옮겨져요. 탭을 닫으면 사라져요."}
        </p>

        <label className="mb-4 flex items-center gap-2 text-sm text-[#606774]">
          큰 화면의 카드 열 수
          <select
            value={columns}
            onChange={(event) => {
              const nextColumns = event.target.value === "3" ? 3 : 5;
              setColumns(nextColumns);

              try {
                localStorage.setItem(GRID_COLUMNS_KEY, String(nextColumns));
              } catch {
                // 저장소를 사용할 수 없어도 현재 화면의 설정은 적용한다.
              }
            }}
            className="rounded border border-[#d9dde3] bg-white px-2 py-1"
          >
            <option value={5}>5열 (기본)</option>
            <option value={3}>3열</option>
          </select>
        </label>

        {/* API 요청 상태에 따라 화면 구분 */}
        {isLoading ? (
          <p>영화 목록을 불러오는 중이에요.</p>
        ) : errorMessage ? (
          <div>
            <p role="alert">{errorMessage}</p>
            <RetryButton onRetry={() => { setIsLoading(true); setRetryCount((count) => count + 1); }} />
          </div>
        ) : movies.length === 0 ? (
          <p>조건에 맞는 영화가 없어요.</p>
        ) : (
          <>
            <MovieGrid movies={movies} columns={columns} />
          </>
        )}
        {!isLoading && !errorMessage && (
          <Pagination currentPage={page} totalPages={totalPages}
            onPageChange={(nextPage) => { void navigate({ search: { page: nextPage } }); }} />
        )}
      </main>

    </>
  );
}
