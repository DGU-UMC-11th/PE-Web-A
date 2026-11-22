import { checkMutation, readApiResult } from "../api-response";
import { authApi } from "../auth-api";

interface FavoriteMovie {
  movieId: number;
  title?: string;
}

export const favoriteListKey = ["favorites", "list"] as const;
export const favoriteDetailKey = (movieId: number) =>
  ["favorites", "detail", movieId] as const;

export function getFavorites(signal?: AbortSignal) {
  return readApiResult<FavoriteMovie[]>(authApi.get("favorites", { signal }));
}

export function addFavorite(movieId: number) {
  return checkMutation(authApi.post("favorites", { json: { movieId } }));
}

export function deleteFavorite(movieId: number) {
  return checkMutation(authApi.delete(`favorites/${movieId}`, { retry: 0 }));
}
