import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "../pages/movies/search-page";

export const Route = createFileRoute("/search")({
  validateSearch: (search): { query?: string; page: number } => ({
    page: Number.isInteger(Number(search.page)) && Number(search.page) > 0 && Number(search.page) <= 500 ? Number(search.page) : 1,
    query: typeof search.query === "string" ? search.query : undefined,
  }),
  component: SearchPage,
});
