import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "../pages/movies/search-page";
import { parsePage } from "../utils/movies/parse-page";

export const Route = createFileRoute("/search")({
  validateSearch: (search): { query?: string; page?: number } => ({
    query: typeof search.query === "string" ? search.query : undefined,
    page: parsePage(search.page),
  }),
  component: SearchPage,
});
