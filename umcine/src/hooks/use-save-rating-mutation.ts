import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRating } from "@/api/ratings/create-rating";
import type { Rating } from "@/api/ratings/models";
import { updateRating } from "@/api/ratings/update-rating";
import { RATING_QUERY_KEYS } from "@/hooks/use-member-ratings-query";
import { useMemberId } from "@/hooks/use-member-id";

interface SaveRatingVariables {
  movieId: number;
  score: number;
  comment: string | null;
  // 이미 남긴 평점이 있으면 PATCH, 없으면 POST
  ratingId?: number;
}

export function useSaveRatingMutation() {
  const queryClient = useQueryClient();
  const memberId = useMemberId();

  return useMutation({
    mutationFn: ({ ratingId, movieId, score, comment }: SaveRatingVariables) =>
      ratingId === undefined
        ? createRating({ movieId, score, comment })
        : updateRating({ ratingId, score, comment }),
    onSuccess: (response) => {
      if (memberId !== null) {
        // 응답에 저장된 평점이 그대로 오므로 목록 캐시에서 같은 평점을 바꾸거나 맨 앞에 넣는다.
        queryClient.setQueryData<Rating[]>(RATING_QUERY_KEYS.member(memberId), (prev) =>
          prev
            ? [response.result, ...prev.filter((rating) => rating.ratingId !== response.result.ratingId)]
            : prev,
        );
      }
      alert("평점을 저장했어요.");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: RATING_QUERY_KEYS.all });
      alert("평점 저장에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
