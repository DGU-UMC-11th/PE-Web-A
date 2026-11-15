
import "../../App.css";
import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { RetryButton } from "../../components/retry-button";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { useBookmarkStore } from "../../stores/bookmark-store";

import { movieQueryOptions } from "../../api/movies/query-options";
import { toMovieListItem } from "../../api/movies/adapters";

const GRID_COLUMNS_KEY = "umcine-grid-columns";

export function MovieListPage() {
  // 5주차: URL에서 페이지 번호 가져오기
  const { page = 1 } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  // 기존 북마크 설정
  const storageMode = useBookmarkStore(
    (state) => state.storageMode
  );
  const setStorageMode = useBookmarkStore(
    (state) => state.setStorageMode
  );

  // 기존 카드 열 수 설정
  const [columns, setColumns] = useState<3 | 5>(() => {
    try {
      return localStorage.getItem(GRID_COLUMNS_KEY) === "3" ? 3 : 5;
    } catch {
      return 5;
    }
  });

  const moviesQuery = useQuery(movieQueryOptions.list({ page }));

  // TMDB 데이터를 MovieGrid 형식으로 변환
  const movies =
    moviesQuery.data?.results.map(toMovieListItem) ?? [];

  const totalPages =
    moviesQuery.data?.total_pages ?? 0;

  // 페이지 변경 시 URL 업데이트
  const handlePageChange = (nextPage: number) => {
    void navigate({
      search: { page: nextPage },
    });
  };

  return (
    <>
      <main className="main-content">
        <h1 className="page-title">영화 목록</h1>

        <label className="mb-4 flex items-center gap-2 text-sm text-[#606774]">
          북마크 저장
          <select
            value={storageMode}
            onChange={(event) =>
              setStorageMode(
                event.target.value === "session"
                  ? "session"
                  : "local"
              )
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
              const nextColumns =
                event.target.value === "3" ? 3 : 5;

              setColumns(nextColumns);

              try {
                localStorage.setItem(
                  GRID_COLUMNS_KEY,
                  String(nextColumns)
                );
              } catch {
                // 저장소 오류여도 화면 설정은 유지
              }
            }}
            className="rounded border border-[#d9dde3] bg-white px-2 py-1"
          >
            <option value={5}>5열 (기본)</option>
            <option value={3}>3열</option>
          </select>
        </label>

        {/* 6주차: 요청 상태 처리 */}
        {moviesQuery.isPending ? (
          <p>영화 목록을 불러오는 중이에요.</p>
        ) : moviesQuery.isError ? (
          <div>
            <p role="alert">
              {moviesQuery.error.message}
            </p>
            <RetryButton
              onRetry={() => {
                void moviesQuery.refetch();
              }}
            />
          </div>
        ) : movies.length === 0 ? (
          <p>표시할 영화가 없어요.</p>
        ) : (
          <MovieGrid
            movies={movies}
            columns={columns}
          />
        )}

        {/* 페이지네이션 */}
        {moviesQuery.isSuccess && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </>
  );
}
