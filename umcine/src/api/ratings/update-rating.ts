import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { Rating } from "@/api/ratings/models";

// dto/UpdateRatingRequest.java
export interface UpdateRatingRequest {
  ratingId: number;
  score: number;
  comment: string | null;
}

// PATCH /ratings/{ratingId}
export function updateRating({ ratingId, ...body }: UpdateRatingRequest) {
  return authApi.patch(`ratings/${ratingId}`, { json: body }).json<ApiResponse<Rating>>();
}
