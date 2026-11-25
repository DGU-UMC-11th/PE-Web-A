import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { Favorite } from "@/api/favorites/models";

// POST /favorites
export function createFavorite(movieId: number) {
  return authApi.post("favorites", { json: { movieId } }).json<ApiResponse<Favorite>>();
}
