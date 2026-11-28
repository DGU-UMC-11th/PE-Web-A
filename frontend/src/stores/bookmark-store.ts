import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BOOKMARK_STORAGE_KEY, readBookmarkIds } from "../utils/bookmark-storage";

const BOOKMARK_STORE_KEY = "umcine-bookmark-store";
const STORAGE_MODE_KEY = "umcine-bookmark-storage-mode";
type StorageMode = "local" | "session";

function readStorageMode(): StorageMode {
  try {
    return sessionStorage.getItem(STORAGE_MODE_KEY) === "session" ? "session" : "local";
  } catch {
    return "local";
  }
}

let activeStorageMode: StorageMode = "local";

function selectedStorage(mode = activeStorageMode) {
  return mode === "session" ? sessionStorage : localStorage;
}

function prepareBookmarkStorage() {
  const storage = selectedStorage();
  let storedValue = storage.getItem(BOOKMARK_STORE_KEY);
  let bookmarkedMovieIds: number[] = [];

  // 이전 sessionStorage 실습의 데이터도 기본 저장 모드로 한 번 이관한다.
  if (storedValue === null && activeStorageMode === "local") {
    storedValue = sessionStorage.getItem(BOOKMARK_STORE_KEY);
  }

  if (storedValue === null) {
    if (activeStorageMode === "local") bookmarkedMovieIds = readBookmarkIds();
  } else {
    try {
      const parsed: unknown = JSON.parse(storedValue);
      if (
        parsed && typeof parsed === "object" &&
        "state" in parsed && parsed.state && typeof parsed.state === "object" &&
        "bookmarkedMovieIds" in parsed.state &&
        Array.isArray(parsed.state.bookmarkedMovieIds)
      ) {
        bookmarkedMovieIds = parsed.state.bookmarkedMovieIds.filter(
          (id): id is number =>
            typeof id === "number" && Number.isInteger(id) && id > 0,
        );
      }
    } catch {
      // 잘못된 JSON은 빈 북마크 배열로 복구한다.
    }
  }

  storage.setItem(
    BOOKMARK_STORE_KEY,
    JSON.stringify({ state: { bookmarkedMovieIds }, version: 0 }),
  );
  localStorage.removeItem(BOOKMARK_STORAGE_KEY);
  if (activeStorageMode === "local") sessionStorage.removeItem(BOOKMARK_STORE_KEY);
}

export function hydrateBookmarkStore() {
  if (useBookmarkStore.persist.hasHydrated()) return;
  try {
    activeStorageMode = readStorageMode();
    prepareBookmarkStorage();
  } catch {
    // 저장소에 접근할 수 없어도 현재 탭에서는 상태를 사용할 수 있다.
  }
  void useBookmarkStore.persist.rehydrate();
  useBookmarkStore.setState({ storageMode: activeStorageMode });
}

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarkedMovieIds: [],
      storageMode: activeStorageMode,
      setStorageMode: (mode) => {
        if (mode === activeStorageMode) return;
        const previousStorage = selectedStorage();
        const nextStorage = selectedStorage(mode);
        // 현재 북마크를 먼저 저장한 다음 저장소와 화면 상태를 변경한다.
        nextStorage.setItem(
          BOOKMARK_STORE_KEY,
          JSON.stringify({
            state: { bookmarkedMovieIds: get().bookmarkedMovieIds },
            version: 0,
          }),
        );
        sessionStorage.setItem(STORAGE_MODE_KEY, mode);
        activeStorageMode = mode;
        previousStorage.removeItem(BOOKMARK_STORE_KEY);
        set({ storageMode: mode });
      },
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }),
    {
      name: BOOKMARK_STORE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() => ({
        getItem: (name) => selectedStorage().getItem(name),
        setItem: (name, value) => {
          try {
            selectedStorage().setItem(name, value);
          } catch {
            // 저장소에 쓰지 못해도 현재 즐겨찾기 상태는 유지한다.
          }
        },
        removeItem: (name) => selectedStorage().removeItem(name),
      })),
      partialize: (state) => ({
        bookmarkedMovieIds: state.bookmarkedMovieIds,
      }),
    },
  ),
);
