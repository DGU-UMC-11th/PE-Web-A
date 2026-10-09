
import "../../App.css";
import { useState } from "react";

import Footer from "../../components/footer";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { movies } from "../../data/movies";
import { useBookmarkStore } from "../../stores/bookmark-store";

const GRID_COLUMNS_KEY = "umcine-grid-columns";

export function MovieListPage() {
  const storageMode = useBookmarkStore((state) => state.storageMode);
  const setStorageMode = useBookmarkStore((state) => state.setStorageMode);
  const [columns, setColumns] = useState<3 | 5>(() => {
    try {
      return localStorage.getItem(GRID_COLUMNS_KEY) === "3" ? 3 : 5;
    } catch {
      return 5;
    }
  });

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

        <MovieGrid movies={movies} columns={columns} />

        <Pagination />
      </main>

      <Footer />
    </>
  );
}
