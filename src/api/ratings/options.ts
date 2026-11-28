import { mutationOptions, queryOptions, type QueryClient } from "@tanstack/react-query";
import { authApi } from "../auth-api";

interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
}

interface RatingPage {
  content: Rating[];
  last: boolean;
}

const ratingKey = (memberId: number, movieId: number) =>
  ["ratings", memberId, movieId] as const;

export function movieRatingOptions(memberId: number, movieId: number) {
  return queryOptions({
    queryKey: ratingKey(memberId, movieId),
    queryFn: async ({ signal }): Promise<Rating | null> => {
      for (let page = 0; ; page++) {
        const result = await authApi.get(`members/${memberId}/ratings`, {
          searchParams: { page, size: 100 },
          signal,
        }).json<RatingPage>();
        const rating = result.content.find((item) => item.movieId === movieId);
        if (rating) return rating;
        if (result.last) return null;
      }
    },
  });
}

type RatingChange =
  | { ratingId: number; remove: true }
  | { ratingId?: number; score: number; comment: string | null };

export function ratingMutationOptions(queryClient: QueryClient, memberId: number, movieId: number) {
  return mutationOptions({
    mutationKey: ratingKey(memberId, movieId),
    scope: { id: `rating-${memberId}-${movieId}` },
    mutationFn: async (change: RatingChange) => {
      if ("remove" in change) {
        await authApi.delete(`ratings/${change.ratingId}`, { retry: 0 });
        return;
      }

      const { ratingId, ...json } = change;
      if (ratingId !== undefined) {
        await authApi.patch(`ratings/${ratingId}`, { json });
      } else {
        await authApi.post("ratings", { json: { ...json, movieId } });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ratingKey(memberId, movieId) }),
  });
}
