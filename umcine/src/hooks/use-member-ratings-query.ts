import { skipToken, useQuery } from "@tanstack/react-query";
import { getMemberRatings } from "@/api/ratings/get-member-ratings";

export const RATING_QUERY_KEYS = {
  all: ["ratings"] as const,
  member: (memberId: number | null) => ["ratings", "member", memberId] as const,
};

// 회원의 평점 목록. memberId가 없으면(로그인 전) 요청하지 않는다.
export function useMemberRatingsQuery(memberId: number | null) {
  return useQuery({
    queryKey: RATING_QUERY_KEYS.member(memberId),
    queryFn: memberId === null ? skipToken : () => getMemberRatings(memberId),
  });
}
