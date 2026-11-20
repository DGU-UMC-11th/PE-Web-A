import { useNavigate } from '@tanstack/react-router';
import { useIsMutating } from '@tanstack/react-query';
import { useFavorite } from '../../hooks/use-favorites';
import { useAuthStore } from '../../stores/auth-store';
import { errorMessage } from '../../api/api-client';
import { cn } from '../../utils/cn';

/** 서버의 북마크 상태를 표시하고 중복 클릭 없이 추가·해제한다. */
export function BookmarkButton({ movieId, title, compact = false }: { movieId: number; title: string; compact?: boolean }) {
  const token = useAuthStore(state => state.accessToken);
  const navigate = useNavigate();
  const { query, mutation } = useFavorite(movieId);
  const busy = useIsMutating({ mutationKey: ['favorites', 'write', movieId] }) > 0;
  const active = Boolean(token && query.data?.isFavorite);
  const error = mutation.error || query.error;
  return <div className={compact ? 'absolute right-2.5 top-2.5 z-10' : ''}>
    <button type="button" aria-label={`${title} 북마크`} aria-pressed={active}
      disabled={busy || Boolean(token && query.isPending)}
      title={error ? errorMessage(error) : undefined}
      onClick={() => {
        if (!token) { void navigate({ to: '/login' }); return; }
        if (query.isError) { void query.refetch(); return; }
        mutation.mutate(!active);
      }}
      className={cn('flex items-center justify-center gap-2 border text-sm font-extrabold text-white disabled:opacity-50',
        compact ? 'size-[34px] rounded-md hover:ring-2 hover:ring-white/70' : 'h-[42px] rounded-lg px-4',
        active ? 'border-[#2563eb] bg-[#2563eb]' : compact ? 'border-white/60 bg-black/70' : 'border-white bg-[#2563eb]')}>
      <img src={active ? '/icons/bookmark.svg' : '/icons/bookmark-outline.svg'} alt="" className={cn('brightness-0 invert', compact ? 'size-[22px]' : 'size-4')} />
      {!compact && (query.isError ? '북마크 다시 불러오기' : busy ? '저장 중…' : active ? '북마크 해제' : '북마크 추가')}
    </button>
    {error && <p role="alert" className={compact ? 'mt-1 max-w-40 rounded bg-white p-2 text-xs text-red-700 shadow' : 'mt-2 text-sm text-red-700'}>{errorMessage(error)}</p>}
  </div>;
}
