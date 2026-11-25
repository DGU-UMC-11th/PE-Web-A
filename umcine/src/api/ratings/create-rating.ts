import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { Rating } from "@/api/ratings/models";

// dto/CreateRatingRequest.java
export interface CreateRatingRequest {
  movieId: number;
  score: number;
  comment: string | null;
}

// POST /ratings
export function createRating(body: CreateRatingRequest) {
  return authApi.post("ratings", { json: body }).json<ApiResponse<Rating>>();
}
