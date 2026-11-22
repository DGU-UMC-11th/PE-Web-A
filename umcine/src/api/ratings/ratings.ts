import { checkMutation } from "../api-response";
import { authApi } from "../auth-api";

interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
}

export const memberRatingsKey = (memberId: number | undefined) =>
  ["members", memberId, "ratings"] as const;

export async function getMemberRatings(memberId: number, signal?: AbortSignal) {
  const ratings = await authApi.get(`members/${memberId}/ratings`, { signal }).json<Rating[]>();
  if (!Array.isArray(ratings)) {
    throw new Error("평점 목록 응답 형식이 올바르지 않아요.");
  }
  return ratings;
}

export function addRating(movieId: number, score: number) {
  return checkMutation(authApi.post("ratings", { json: { movieId, score } }));
}

export function updateRating(ratingId: number, score: number) {
  return checkMutation(authApi.patch(`ratings/${ratingId}`, { json: { score } }));
}

export function deleteRating(ratingId: number) {
  return checkMutation(authApi.delete(`ratings/${ratingId}`, { retry: 0 }));
}
