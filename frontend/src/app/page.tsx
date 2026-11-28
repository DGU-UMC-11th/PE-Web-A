import { Suspense } from "react";
import { MovieListPage } from "@/features/movies/movie-list-page";

export default function Page() {
  return (
    <Suspense fallback={<main className="main-content">영화 목록을 불러오는 중이에요.</main>}>
      <MovieListPage />
    </Suspense>
  );
}
