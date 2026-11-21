import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRating } from "@/api/ratings/delete-rating";
import type { Rating } from "@/api/ratings/models";
import { RATING_QUERY_KEYS } from "@/hooks/use-member-ratings-query";
import { useMemberId } from "@/hooks/use-member-id";

export function useDeleteRatingMutation() {
  const queryClient = useQueryClient();
  const memberId = useMemberId();

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: (_response, ratingId) => {
      if (memberId !== null) {
        queryClient.setQueryData<Rating[]>(RATING_QUERY_KEYS.member(memberId), (prev) =>
          prev?.filter((rating) => rating.ratingId !== ratingId),
        );
      }
      alert("평점을 삭제했어요.");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: RATING_QUERY_KEYS.all });
      alert("평점 삭제에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
