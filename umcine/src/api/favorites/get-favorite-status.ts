import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { FavoriteStatus } from "@/api/favorites/models";

// GET /favorites/{movieId}: 이 영화를 즐겨찾기했는지 여부
export async function getFavoriteStatus(movieId: number) {
  const response = await authApi
    .get(`favorites/${movieId}`)
    .json<ApiResponse<FavoriteStatus>>();
  return response.result;
}
