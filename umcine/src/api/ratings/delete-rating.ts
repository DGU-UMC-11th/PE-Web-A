import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";

// DELETE /ratings/{ratingId}: 성공하면 result는 null
export function deleteRating(ratingId: number) {
  return authApi.delete(`ratings/${ratingId}`).json<ApiResponse<null>>();
}
