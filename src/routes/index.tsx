import { createFileRoute } from "@tanstack/react-router";
import { MovieListPage } from "../pages/movies/movie-list-page";
import { parsePage } from "../utils/movies/parse-page";

export const Route = createFileRoute("/")({
  validateSearch: (search): { page?: number } => ({ page: parsePage(search.page) }),
  component: MovieListPage,
});
