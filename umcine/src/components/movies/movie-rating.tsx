import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import {
  addRating,
  deleteRating,
  getMemberRatings,
  memberRatingsKey,
  updateRating,
} from "../../api/ratings/ratings";
import { useMeQuery } from "../../hooks/use-me-query";

function getMemberId(accessToken: string | null): number | undefined {
  const payload = accessToken?.split(".")[1];
  if (!payload) return undefined;

  try {
    const { sub } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof sub !== "string" || !/^[1-9]\d*$/.test(sub)) return undefined;
    const memberId = Number(sub);
    return Number.isSafeInteger(memberId) ? memberId : undefined;
  } catch {
    return undefined;
  }
}

export function MovieRating({ movieId }: { movieId: number }) {
  const { accessToken, meQuery } = useMeQuery();
  const memberId = meQuery.isSuccess ? getMemberId(accessToken) : undefined;
  const ratingsQuery = useQuery({
    queryKey: memberRatingsKey(memberId),
    queryFn: memberId === undefined ? skipToken : ({ signal }) => getMemberRatings(memberId, signal),
    retry: false,
  });

  if (!accessToken) return <p>로그인하면 평점을 남길 수 있어요.</p>;
  if (meQuery.isError || ratingsQuery.isError ||
      (meQuery.isSuccess && memberId === undefined)) {
    return (
      <div>
        <p role="alert">내 평점을 불러오지 못했어요.</p>
        <button type="button" onClick={() => {
          if (ratingsQuery.isError) void ratingsQuery.refetch();
          else void meQuery.refetch();
        }}>다시 시도</button>
      </div>
    );
  }
  if (ratingsQuery.isPending || memberId === undefined) {
    return <p role="status">내 평점을 불러오는 중이에요.</p>;
  }

  const rating = ratingsQuery.data.find((item) => item.movieId === movieId);
  return (
    <RatingForm
      key={`${memberId}-${movieId}-${rating?.ratingId}-${rating?.score}`}
      movieId={movieId}
      memberId={memberId}
      rating={rating}
      isRefreshing={ratingsQuery.isFetching}
    />
  );
}

function RatingForm({ movieId, memberId, rating, isRefreshing }: {
  movieId: number;
  memberId: number;
  rating?: { ratingId: number; score: number };
  isRefreshing: boolean;
}) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(rating?.score ?? 5);
  const mutation = useMutation({
    mutationFn: (action: "save" | "delete") => {
      if (!rating) return addRating(movieId, score);
      return action === "delete" ? deleteRating(rating.ratingId) : updateRating(rating.ratingId, score);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberRatingsKey(memberId) }),
  });

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mutation.isPending && !isRefreshing) mutation.mutate("save");
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={mutation.isPending || isRefreshing}>
        <legend>내 평점</legend>
        <label>
          점수{" "}
          <select value={score} onChange={(event) => setScore(Number(event.target.value))}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}점</option>)}
          </select>
        </label>
        <button type="submit">{rating ? "평점 수정" : "평점 등록"}</button>
        {rating && (
          <button type="button" onClick={() => mutation.mutate("delete")}>평점 삭제</button>
        )}
      </fieldset>
      {mutation.isError && <p role="alert">평점을 변경하지 못했어요.</p>}
    </form>
  );
}
