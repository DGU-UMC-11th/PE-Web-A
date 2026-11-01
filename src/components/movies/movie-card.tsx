import { Link } from "@tanstack/react-router";
import { BookmarkButton } from "../bookmark-button";

import type { MovieListItem } from "../../types/movie";

interface MovieCardProps {
  movie: MovieListItem;
}

export default function MovieCard({
  movie,
}: MovieCardProps) {
  return (
    <article className="flex w-full min-w-0 flex-col gap-1">
      <div className="relative h-[274px] w-full overflow-hidden rounded-lg">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          {movie.posterPath ? <img
            className="block h-full w-full object-cover"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          /> : <div className="flex h-full items-center justify-center bg-gray-200">포스터 없음</div>}
        </Link>

        <BookmarkButton movieId={movie.id} />
      </div>

      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="no-underline"
      >
        <h2 className="m-0 text-[14px] font-extrabold leading-5 text-[#17191e]">
          {movie.title}
        </h2>
      </Link>

      <p className="m-0 text-xs font-normal leading-4 text-[#969da8]">
        {movie.releaseDate || "개봉일 미정"}
      </p>
    </article>
  );
}
