import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

/** 저장소 접근이 차단되더라도 앱의 메모리 상태는 사용할 수 있게 한다. */
const storage: StateStorage = {
  getItem: name => { try { return localStorage.getItem(name); } catch { return null; } },
  setItem: (name, value) => { try { localStorage.setItem(name, value); } catch { /* 저장 불가 시 메모리 상태 유지 */ } },
  removeItem: name => { try { localStorage.removeItem(name); } catch { /* 저장소 접근 불가 */ } },
};

/** 외부에서 수정 가능한 저장값에서 양의 정수 ID만 복원한다. */
function restoreIds(value: unknown): number[] {
  if (!value || typeof value !== 'object' || !('bookmarkedMovieIds' in value)) return [];
  const ids = value.bookmarkedMovieIds;
  return Array.isArray(ids)
    ? [...new Set(ids.filter((id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0))]
    : [];
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    set => ({
      bookmarkedMovieIds: [],
      toggleBookmark: movieId => {
        if (!Number.isSafeInteger(movieId) || movieId <= 0) return;
        set(state => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter(id => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        }));
      },
    }),
    {
      name: 'umcine-bookmark-store',
      storage: createJSONStorage(() => storage),
      partialize: state => ({ bookmarkedMovieIds: state.bookmarkedMovieIds }),
      merge: (persisted, current) => ({ ...current, bookmarkedMovieIds: restoreIds(persisted) }),
    },
  ),
);
