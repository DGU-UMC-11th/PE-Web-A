import { apiClient } from "@/api/api-client";
import type { Rating } from "@/api/ratings/models";

// GET /members/{memberId}/ratings
// 누구나 볼 수 있는 공개 API라 토큰 없이 apiClient로 요청한다.
// 5주차 API라 ApiResponse로 감싸지 않고 배열을 그대로 돌려준다.
export function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
}
