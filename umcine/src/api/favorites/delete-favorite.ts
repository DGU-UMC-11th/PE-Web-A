import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";

// DELETE /favorites/{movieId}: 성공하면 result는 null
export function deleteFavorite(movieId: number) {
  return authApi.delete(`favorites/${movieId}`).json<ApiResponse<null>>();
}
