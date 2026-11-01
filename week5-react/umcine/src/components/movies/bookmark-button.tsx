import { useBookmarkStore } from '../../stores/bookmark-store';
import { cn } from '../../utils/cn';

/** 모든 화면에서 같은 ID의 북마크 상태와 action을 구독한다. */
export function BookmarkButton({ movieId, title, compact = false }: {
  movieId: number;
  title: string;
  compact?: boolean;
}) {
  const isBookmarked = useBookmarkStore(state => state.bookmarkedMovieIds.includes(movieId));
  const toggleBookmark = useBookmarkStore(state => state.toggleBookmark);
  return (
    <button type="button" aria-label={`${title} 북마크 ${isBookmarked ? '해제' : '추가'}`}
      aria-pressed={isBookmarked} onClick={() => toggleBookmark(movieId)}
      className={cn('flex items-center justify-center gap-2 border text-sm font-extrabold text-white',
        compact ? 'absolute right-2.5 top-2.5 size-[34px] rounded-md hover:ring-2 hover:ring-white/70' : 'h-[42px] rounded-lg px-4',
        isBookmarked ? 'border-[#2563eb] bg-[#2563eb]' : compact ? 'border-white/60 bg-black/70' : 'border-white bg-[#2563eb]')}>
      <img src={isBookmarked ? '/icons/bookmark.svg' : '/icons/bookmark-outline.svg'} alt=""
        className={cn('brightness-0 invert', compact ? 'size-[22px]' : 'size-4')} />
      {!compact && (isBookmarked ? '북마크 해제' : '북마크 추가')}
    </button>
  );
}
