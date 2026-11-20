import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMemberId } from '../../api/members';
import { createRating, deleteRating, getRatings, updateRating, type Rating, type RatingInput } from '../../api/ratings';
import { useMe } from '../../hooks/use-member';
import { useAuthStore } from '../../stores/auth-store';
import { ErrorNotice, primaryButton, secondaryButton } from '../form';

/** 로그인한 회원의 평점 중 현재 영화에 해당하는 항목을 찾는다. */
export function RatingPanel({ movieId }: { movieId: number }) {
  const token = useAuthStore(state => state.accessToken);
  const me = useMe();
  const memberId = getMemberId(me.data, token);
  const ratings = useQuery({ queryKey: ['ratings', memberId], queryFn: ({ signal }) => getRatings(memberId!, signal), enabled: Boolean(token && me.isSuccess && memberId) });
  if (!token) return <section><h2 className="text-xl font-bold">내 평점</h2><p className="mt-3 text-sm"><Link to="/login" className="text-blue-700 underline">로그인</Link>하고 별점과 후기를 남겨보세요.</p></section>;
  if (me.isError) return <section><ErrorNotice error={me.error} /><button onClick={() => void me.refetch()}>다시 시도</button></section>;
  if (me.isPending) return <p role="status">내 정보를 불러오는 중이에요.</p>;
  if (!memberId) return <p role="alert">회원 번호를 확인할 수 없어 평점을 불러오지 못했어요. 서버의 내 정보 응답을 확인해 주세요.</p>;
  if (ratings.isPending) return <p role="status">내 평점을 불러오는 중이에요.</p>;
  if (ratings.isError) return <section><ErrorNotice error={ratings.error} /><button onClick={() => void ratings.refetch()} className={secondaryButton}>다시 시도</button></section>;
  const rating = ratings.data.find(item => item.movieId === movieId);
  return <RatingForm key={`${memberId}:${movieId}:${rating?.ratingId ?? 'new'}`} movieId={movieId} memberId={memberId} rating={rating} />;
}

/** 생성·수정·삭제가 성공하면 회원 평점 캐시를 무효화한다. 실패한 입력은 그대로 남긴다. */
function RatingForm({ movieId, memberId, rating }: { movieId: number; memberId: number; rating?: Rating }) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? '');
  const [message, setMessage] = useState('');
  const client = useQueryClient();
  const token = useAuthStore(state => state.accessToken);
  const mutation = useMutation({
    mutationFn: (action: { type: 'save'; body: RatingInput } | { type: 'delete' }) => action.type === 'delete'
      ? deleteRating(rating!.ratingId)
      : rating ? updateRating(rating.ratingId, action.body) : createRating({ movieId, ...action.body }),
    onSuccess: async (_, action) => {
      if (token !== useAuthStore.getState().accessToken) return;
      setMessage(action.type === 'delete' ? '평점을 삭제했어요.' : '평점을 저장했어요.');
      await client.invalidateQueries({ queryKey: ['ratings', memberId] });
    },
  });
  return <form className="space-y-3" onSubmit={event => {
    event.preventDefault(); if (score >= 1 && score <= 5 && comment.length <= 500 && !mutation.isPending) mutation.mutate({ type: 'save', body: { score, comment } });
  }}>
    <h2 className="text-xl font-bold">내 평점</h2><p className="text-xs text-gray-600">별점은 필수, 후기는 선택이에요.</p>
    <fieldset disabled={mutation.isPending} className="flex gap-2"><legend className="sr-only">영화 별점</legend>
      {[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer"><input type="radio" name="score" value={value} checked={score === value} onChange={() => { setScore(value); setMessage(''); }} className="peer sr-only" />
        <span className={`flex size-10 items-center justify-center rounded-lg border bg-white text-2xl peer-focus-visible:outline-2 peer-focus-visible:outline-blue-600 ${value <= score ? 'text-yellow-500' : 'text-gray-400'}`} aria-hidden="true">★</span><span className="sr-only">{value}점</span></label>)}
    </fieldset>
    <label className="block text-sm">영화 후기<textarea value={comment} onChange={event => { setComment(event.target.value); setMessage(''); }} maxLength={500} disabled={mutation.isPending} placeholder="영화를 보고 느낀 점을 남겨보세요." className="mt-2 h-28 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
    <p className="text-right text-xs text-gray-500">{comment.length}/500자</p>
    <ErrorNotice error={mutation.error} />{message && <p role="status" className="text-sm text-blue-700">{message}</p>}
    <div className="flex gap-2"><button className={`${primaryButton} flex-1`} disabled={!score || mutation.isPending}>{mutation.isPending ? '처리 중…' : rating ? '평점 수정' : '평점 저장'}</button>
      {rating && <button type="button" className={secondaryButton} disabled={mutation.isPending} onClick={() => { if (window.confirm('내 평점을 삭제할까요?')) mutation.mutate({ type: 'delete' }); }}>삭제</button>}</div>
  </form>;
}
