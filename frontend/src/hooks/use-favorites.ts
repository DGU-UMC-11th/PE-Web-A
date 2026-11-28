import { useQuery } from "@tanstack/react-query";
import { favoritesListOptions, isFavoritesEndpointMissing } from "../api/favorites/options";
import { useAuthStore } from "../stores/auth-store";
import { useBookmarkStore } from "../stores/bookmark-store";

export function useFavorites() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const localIds = useBookmarkStore((state) => state.bookmarkedMovieIds);
  const list = useQuery({ ...favoritesListOptions, enabled: Boolean(accessToken) });
  const useLocal = !accessToken || isFavoritesEndpointMissing(list.error);
  const ids = list.data ?? localIds;

  return {
    list,
    useLocal,
    ids: useLocal ? localIds : ids,
  };
}
