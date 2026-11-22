import { apiClient } from "./api-client";
import { authApi } from "./auth-api";

export interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// GET /members/{memberId}/ratings (공개 API, 응답이 배열 그대로 옴)
export function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
}

// POST /ratings
export function createRating(body: { movieId: number; score: number; comment: string }) {
  return authApi.post("ratings", { json: body }).json<ApiResponse<Rating>>();
}

// PATCH /ratings/{ratingId}
export function updateRating(ratingId: number, body: { score: number; comment: string }) {
  return authApi.patch(`ratings/${ratingId}`, { json: body }).json<ApiResponse<Rating>>();
}

// DELETE /ratings/{ratingId}
export function deleteRating(ratingId: number) {
  return authApi.delete(`ratings/${ratingId}`).json<ApiResponse<null>>();
}