import { Suspense } from "react";
import { MovieDetailPage } from "@/features/movies/movie-detail-page";

type MovieParams = Promise<{ movieId: string }>;

async function MovieDetail({ params }: { params: MovieParams }) {
  const { movieId } = await params;
  return <MovieDetailPage key={movieId} movieId={movieId} />;
}

export default function Page({ params }: { params: MovieParams }) {
  return (
    <Suspense fallback={<main>영화 정보를 불러오는 중이에요.</main>}>
      <MovieDetail params={params} />
    </Suspense>
  );
}
