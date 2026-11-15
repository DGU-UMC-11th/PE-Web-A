import { createFileRoute } from "@tanstack/react-router";
import { MovieListPage } from "../pages/movies/movie-list-page";

export const Route = createFileRoute("/")({
  validateSearch: (search): { page: number } => {
    const page = Number(search.page ?? 1);
    return { page: Number.isInteger(page) && page > 0 && page <= 500 ? page : 1 };
  },
  component: MovieListPage,
});
