import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { Favorite } from "@/api/favorites/models";

// GET /favorites: 내 즐겨찾기 목록 (최근 등록순)
export async function getFavorites() {
  const response = await authApi.get("favorites").json<ApiResponse<Favorite[]>>();
  return response.result;
}
