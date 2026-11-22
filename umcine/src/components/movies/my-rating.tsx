import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../../api/members/me";
import { createRating, deleteRating, getMemberRatings, updateRating } from "../../api/ratings";
import { useAuthStore } from "../../stores/auth-store";

interface MyRatingProps {
  movieId: number;
}

export function MyRating({ movieId }: MyRatingProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  // 1. 내 정보에서 memberId 가져오기 (헤더와 같은 캐시를 씀)
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const memberId = meQuery.data?.memberId;

  // 2. 내 평점 목록에서 이 영화의 평점 찾기
  const ratingsQuery = useQuery({
    queryKey: ["ratings", "member", memberId],
    queryFn: () => getMemberRatings(memberId!),
    enabled: memberId !== undefined,
  });
  const myRating = ratingsQuery.data?.find((rating) => rating.movieId === movieId);

  // 등록·수정·삭제에 성공하면 평점 캐시를 다시 조회
  const refreshRatings = () => {
    queryClient.invalidateQueries({ queryKey: ["ratings"] });
    setIsEditing(false);
  };

  const createMutation = useMutation({
    mutationFn: createRating,
    onSuccess: refreshRatings,
    onError: () => alert("평점 등록에 실패했어요."),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { score: number; comment: string }) =>
      updateRating(myRating!.ratingId, body),
    onSuccess: refreshRatings,
    onError: () => alert("평점 수정에 실패했어요."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRating,
    onSuccess: refreshRatings,
    onError: () => alert("평점 삭제에 실패했어요."),
  });

  const startEdit = () => {
    if (!myRating) return;
    setScore(myRating.score);
    setComment(myRating.comment ?? "");
    setIsEditing(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ score, comment });
    } else {
      createMutation.mutate({ movieId, score, comment });
    }
  };

  if (!accessToken) {
    return (
      <Link to="/login" className="text-sm underline">
        로그인하고 평점 남기기
      </Link>
    );
  }

  if (meQuery.isLoading || ratingsQuery.isLoading) {
    return <p className="text-sm text-neutral-500">내 평점을 불러오는 중이에요.</p>;
  }

  // 이미 평점이 있고 수정 중이 아닐 때: 내 평점 보여 주기
  if (myRating && !isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded border border-neutral-300 p-4">
        <p className="font-bold">내 평점: {"★".repeat(myRating.score)} ({myRating.score}점)</p>
        <p>{myRating.comment || "후기 없음"}</p>
        <div className="flex gap-2">
          <button type="button" onClick={startEdit} className="rounded border px-3 py-1">
            수정
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(myRating.ratingId)}
            disabled={deleteMutation.isPending}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            삭제
          </button>
        </div>
      </div>
    );
  }

  // 평점이 없거나 수정 중일 때: 입력 폼
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded border border-neutral-300 p-4">
      <p className="font-bold">{isEditing ? "평점 수정" : "평점 남기기"}</p>
      <select
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="rounded border border-neutral-300 px-3 py-2"
      >
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {value}점
          </option>
        ))}
      </select>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="한 줄 후기 (선택)"
        className="rounded border border-neutral-300 px-3 py-2"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-neutral-900 px-4 py-2 font-bold text-white disabled:opacity-40"
        >
          {isEditing ? "수정 완료" : "등록"}
        </button>
        {isEditing && (
          <button type="button" onClick={() => setIsEditing(false)} className="rounded border px-4 py-2">
            취소
          </button>
        )}
      </div>
    </form>
  );
}