import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

function normalizeBookmarkIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(
    (id): id is number => typeof id === "number" && Number.isSafeInteger(id) && id > 0,
  ))];
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarkedMovieIds: [],
      toggleBookmark: (movieId) => {
        if (!Number.isSafeInteger(movieId) || movieId <= 0) return;
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        }));
      },
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ bookmarkedMovieIds: state.bookmarkedMovieIds }),
      merge: (persistedState, currentState) => {
        const savedIds = typeof persistedState === "object" && persistedState !== null &&
          "bookmarkedMovieIds" in persistedState ? persistedState.bookmarkedMovieIds : [];
        return { ...currentState, bookmarkedMovieIds: normalizeBookmarkIds(savedIds) };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.warn("북마크 복원 실패: 기본 상태를 사용합니다.", error);
      },
    },
  ),
);
