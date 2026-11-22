import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getMemberId, useAuthStore } from "../../stores/auth-store";
import { getRatings, createRating, updateRating, deleteRating, type Rating } from "../../api/members/account-api";

export function RatingPanel({ movieId }: { movieId: number }) {
  const { accessToken, session } = useAuthStore();
  const memberId = getMemberId(accessToken);
  const ratings = useQuery({
    queryKey: ["ratings", session, memberId], queryFn: () => getRatings(memberId!),
    enabled: !!accessToken && !!memberId, retry: false,
  });
  if (!accessToken) return <p className="mt-6"><Link to="/login" className="text-blue-600">로그인 후 평점을 남겨보세요.</Link></p>;
  if (!memberId) return <p role="alert">회원 번호를 확인할 수 없어요. 다시 로그인해 주세요.</p>;
  if (ratings.isPending) return <p role="status">평점을 불러오는 중이에요.</p>;
  if (ratings.isError) return <p role="alert">평점을 불러오지 못했어요. <button onClick={() => void ratings.refetch()}>다시 시도</button></p>;
  const rating = ratings.data.find((item) => item.movieId === movieId);
  return <RatingForm key={JSON.stringify(rating) + movieId} movieId={movieId} rating={rating} session={session} />;
}

function RatingForm({ movieId, rating, session }: { movieId: number; rating?: Rating; session: number }) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (action: "save" | "delete") => {
      if (action === "delete" && rating) return deleteRating(rating.ratingId);
      return rating ? updateRating(rating.ratingId, { score, comment }) : createRating({ movieId, score, comment });
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["ratings", session] }); },
  });
  return (
    <form className="mt-6 max-w-lg space-y-3 rounded-lg border border-gray-200 bg-white p-5"
      onSubmit={(event) => { event.preventDefault(); if (score >= 1 && score <= 5 && comment.length <= 500 && !mutation.isPending) mutation.mutate("save"); }}>
      <h2 className="font-bold">내 평점</h2>
      <div role="group" aria-label="별점" className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={value + "점"}
          aria-pressed={score === value} disabled={mutation.isPending} onClick={() => setScore(value)}
          className={`rounded border px-3 py-2 text-xl ${value <= score ? "text-blue-600" : "text-gray-400"}`}>★</button>)}
      </div>
      <textarea aria-label="영화 후기" placeholder="영화를 보고 느낀 점을 남겨보세요." maxLength={500}
        value={comment} disabled={mutation.isPending} onChange={(event) => setComment(event.target.value)}
        className="min-h-24 w-full rounded border p-3" />
      <button disabled={!score || mutation.isPending} className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-40">
        {mutation.isPending ? "저장 중" : rating ? "평점 수정" : "평점 저장"}
      </button>
      {rating && <button type="button" disabled={mutation.isPending} className="ml-3 text-red-600" onClick={() => mutation.mutate("delete")}>평점 삭제</button>}
      {mutation.isError && <p role="alert" className="text-red-600">평점을 변경하지 못했어요. 다시 시도해 주세요.</p>}
    </form>
  );
}
