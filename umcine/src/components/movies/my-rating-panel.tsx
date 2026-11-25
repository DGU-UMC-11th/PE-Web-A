import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/icon";
import { useDeleteRatingMutation } from "@/hooks/use-delete-rating-mutation";
import { useMemberId } from "@/hooks/use-member-id";
import { useMemberRatingsQuery } from "@/hooks/use-member-ratings-query";
import { useSaveRatingMutation } from "@/hooks/use-save-rating-mutation";
import { useAuthStore } from "@/stores/auth-store";

const ratingScores = [1, 2, 3, 4, 5];

interface MyRatingPanelProps {
  movieId: number;
}

/**
 * 영화 상세의 "내 평점" 패널. 내 평점 목록에서 이 영화의 평점을 찾아 별점과 후기를 채운다.
 * 영화가 바뀌면 입력값이 섞이지 않도록 부모에서 key={movieId}로 렌더링한다.
 * @param movieId 영화 ID
 */
export function MyRatingPanel({ movieId }: MyRatingPanelProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = Boolean(accessToken);
  const memberId = useMemberId();
  const ratingsQuery = useMemberRatingsQuery(memberId);
  const myRating = ratingsQuery.data?.find((rating) => rating.movieId === movieId);

  const saveRatingMutation = useSaveRatingMutation();
  const deleteRatingMutation = useDeleteRatingMutation();
  const isMutating = saveRatingMutation.isPending || deleteRatingMutation.isPending;

  // 사용자가 직접 바꾸기 전(null)에는 서버에 저장된 평점을 그대로 보여준다.
  const [scoreDraft, setScoreDraft] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState<string | null>(null);
  const score = scoreDraft ?? myRating?.score ?? 0;
  const comment = commentDraft ?? myRating?.comment ?? "";

  // 로그인 전이거나 내 평점을 아직 못 불러왔거나 요청 중이면 입력을 막는다.
  const isInputDisabled = !isLoggedIn || !ratingsQuery.isSuccess || isMutating;
  const canSave = !isInputDisabled && score > 0;

  const resetDrafts = () => {
    setScoreDraft(null);
    setCommentDraft(null);
  };

  const handleSave = () => {
    if (!canSave) return;

    saveRatingMutation.mutate(
      {
        movieId,
        score,
        comment: comment.trim() || null,
        ratingId: myRating?.ratingId,
      },
      // 캐시가 저장된 평점으로 바뀌었으니 입력값도 서버 값을 따르게 한다.
      { onSuccess: resetDrafts },
    );
  };

  const handleDelete = () => {
    if (!myRating || isMutating) return;

    deleteRatingMutation.mutate(myRating.ratingId, { onSuccess: resetDrafts });
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 border-line pb-[41px] lg:w-[360px] lg:border-l lg:pl-[30px]">
      <h2 className="text-[21px]/[25px] font-bold tracking-[-0.63px] text-ink">내 평점</h2>
      <p className="text-xs/[14px] text-subtle">별점은 필수, 후기는 선택이에요.</p>
      {!isLoggedIn ? (
        <p className="text-xs/[14px] text-muted">
          로그인 후 평점을 남길 수 있어요.{" "}
          <Link to="/login" className="font-bold text-brand">
            로그인
          </Link>
        </p>
      ) : memberId === null || ratingsQuery.isError ? (
        <p className="text-xs/[14px] text-muted">내 평점을 불러오지 못했어요.</p>
      ) : ratingsQuery.isPending ? (
        <p className="text-xs/[14px] text-muted">내 평점을 불러오는 중이에요.</p>
      ) : null}
      <div className="flex gap-1">
        {ratingScores.map((ratingScore) => {
          const isFilled = ratingScore <= score;
          return (
            <button
              key={ratingScore}
              type="button"
              aria-label={`${ratingScore}점`}
              aria-pressed={ratingScore === score}
              disabled={isInputDisabled}
              onClick={() => setScoreDraft(ratingScore)}
              className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                name={isFilled ? "star" : "star-outline"}
                className={isFilled ? "size-6 text-brand" : "size-6 text-muted"}
              />
            </button>
          );
        })}
      </div>
      <textarea
        aria-label="후기"
        placeholder="영화를 보고 느낀 점을 남겨보세요."
        value={comment}
        onChange={(e) => setCommentDraft(e.target.value)}
        disabled={isInputDisabled}
        maxLength={500}
        className="h-[102px] w-full resize-none rounded-lg border border-line bg-white px-3 pt-4 pb-[18px] text-[13px]/5 text-ink placeholder:text-subtle disabled:cursor-not-allowed disabled:bg-page"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="h-[42px] w-full cursor-pointer rounded-lg border border-white bg-ink text-sm/[17px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saveRatingMutation.isPending ? "저장 중" : "평점 저장"}
      </button>
      {myRating && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isMutating}
          className="cursor-pointer self-end text-xs/[14px] font-bold text-muted underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleteRatingMutation.isPending ? "삭제 중" : "평점 삭제"}
        </button>
      )}
    </aside>
  );
}
