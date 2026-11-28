import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getMe } from "../../api/members/me";
import { movieRatingOptions, ratingMutationOptions } from "../../api/ratings/options";
import { useAuthStore } from "../../stores/auth-store";

export function MovieRating({ movieId }: { movieId: number }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const member = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const memberId = member.data?.memberId ?? readMemberId(accessToken);

  return (
    <aside className="min-h-[294px] w-[360px] shrink-0 border-l border-[#d9dde3] pl-[28px]">
      <h2 className="text-[20px] font-extrabold leading-[28px] text-[#17191e]">내 평점</h2>
      {!accessToken ? (
        <Link href="/login" className="mt-3 inline-block underline">로그인 후 평점 남기기</Link>
      ) : memberId ? (
        <RatingPanel key={memberId} memberId={memberId} movieId={movieId} />
      ) : member.isError || member.data ? (
        <button type="button" onClick={() => void member.refetch()}>회원 정보 다시 불러오기</button>
      ) : <p role="status">회원 정보를 불러오는 중이에요.</p>}
    </aside>
  );
}

// 7주차 서버는 /members/me에 ID를 포함하지 않으므로 조회 경로에 JWT의 subject를 사용합니다.
function readMemberId(token: string | null): number | undefined {
  const payload = token?.split(".")[1];
  if (!payload) return undefined;

  try {
    const { sub } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const memberId = Number(sub);
    return Number.isSafeInteger(memberId) && memberId > 0 ? memberId : undefined;
  } catch {
    return undefined;
  }
}

function RatingPanel({ memberId, movieId }: { memberId: number; movieId: number }) {
  const current = useQuery(movieRatingOptions(memberId, movieId));
  const queryClient = useQueryClient();
  const mutation = useMutation(ratingMutationOptions(queryClient, memberId, movieId));

  if (current.isError) {
    return <button type="button" onClick={() => void current.refetch()}>평점 다시 불러오기</button>;
  }
  if (current.isPending) return <p role="status">평점을 불러오는 중이에요.</p>;

  const rating = current.data;
  return (
    <RatingForm
      key={rating?.ratingId ?? "new"}
      initialScore={rating?.score ?? 0}
      initialComment={rating?.comment ?? ""}
      saved={rating !== null}
      pending={mutation.isPending}
      failed={mutation.isError}
      onSave={(score, comment) => mutation.mutate({ ratingId: rating?.ratingId, score, comment })}
      onDelete={() => {
        if (rating) mutation.mutate({ ratingId: rating.ratingId, remove: true });
      }}
    />
  );
}

interface RatingFormProps {
  initialScore: number;
  initialComment: string;
  saved: boolean;
  pending: boolean;
  failed: boolean;
  onSave: (score: number, comment: string | null) => void;
  onDelete: () => void;
}

function RatingForm({ initialScore, initialComment, saved, pending, failed, onSave, onDelete }: RatingFormProps) {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState(initialComment);
  const changed = score !== initialScore || comment.trim() !== initialComment;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (score && changed && !pending) onSave(score, comment.trim() || null);
  }

  return (
    <form onSubmit={submit}>
      <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
        <legend className="mt-[4px] text-[12px] leading-[18px] text-[#969da8]">별점은 필수, 후기는 선택이에요.</legend>
        <div className="mt-[12px] flex gap-[8px]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" aria-label={`${star}점`} aria-pressed={score === star}
              onClick={() => setScore(star)}
              className={`flex h-[38px] w-[38px] items-center justify-center rounded-[8px] border border-[#d9dde3] bg-white text-[24px] ${star <= score ? "text-[#f7b500]" : "text-[#606774]"}`}>
              ★
            </button>
          ))}
        </div>
        <textarea aria-label="후기" maxLength={500} value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="영화를 보고 느낀 점을 남겨보세요."
          className="mt-[12px] h-[100px] w-full resize-none rounded-[8px] border border-[#d9dde3] bg-white p-[14px] text-[13px] leading-[20px] text-[#17191e] outline-none placeholder:text-[#969da8]" />
        <div className="mt-[10px] flex gap-2">
          <button type="submit" disabled={!score || !changed} className="h-[40px] flex-1 rounded-[7px] bg-[#17191e] text-[14px] font-bold text-white disabled:opacity-50">
            {pending ? "처리 중" : saved ? "평점 수정" : "평점 저장"}
          </button>
          {saved && <button type="button" className="rounded-lg border px-4 py-2" onClick={onDelete}>평점 삭제</button>}
        </div>
      </fieldset>
      {failed && <p role="alert" className="mt-2 text-sm text-red-700">평점을 변경하지 못했어요. 다시 시도해 주세요.</p>}
      {saved && !changed && !failed && <p role="status" className="mt-2 text-sm text-slate-600">저장된 평점이에요.</p>}
    </form>
  );
}
