import { mutationOptions, queryOptions, type QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { authApi } from "../auth-api";

interface Favorite {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

interface FavoriteStatus {
  isFavorite: boolean;
}

export function isFavoritesEndpointMissing(error: unknown) {
  return error instanceof HTTPError &&
    error.response.status === 404 &&
    (error.data as { code?: string } | undefined)?.code !== "FAVORITE404_1";
}

const listKey = ["favorites", "list"] as const;
const detailKey = (movieId: number) => ["favorites", "detail", movieId] as const;

export const favoritesListOptions = queryOptions({
  queryKey: listKey,
  retry: false,
  queryFn: async ({ signal }) => {
    const response = await authApi.get("favorites", {
      signal,
      retry: 0,
      timeout: 4_000,
    }).json<{ result: Favorite[] }>();
    return response.result.map((favorite) => favorite.movieId);
  },
});

export function favoriteDetailOptions(movieId: number) {
  return queryOptions({
    queryKey: detailKey(movieId),
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await authApi.get(`favorites/${movieId}`, { signal, retry: 0, timeout: 4_000 })
        .json<{ result: FavoriteStatus }>();
      return response.result.isFavorite;
    },
  });
}

export function favoriteMutationOptions(queryClient: QueryClient, movieId: number) {
  return mutationOptions({
    mutationKey: detailKey(movieId),
    scope: { id: `favorite-${movieId}` },
    mutationFn: async (favorited: boolean) => {
      if (!favorited) {
        await authApi.delete(`favorites/${movieId}`, { retry: 0 });
        return false;
      }

      await authApi.post("favorites", { json: { movieId } });
      return true;
    },
    onSuccess: async (favorited) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey(movieId) }),
        queryClient.cancelQueries({ queryKey: listKey }),
      ]);
      queryClient.setQueryData(detailKey(movieId), favorited);
      const current = queryClient.getQueryData<number[]>(listKey);
      if (current) {
        queryClient.setQueryData(listKey, favorited
          ? [movieId, ...current.filter((id) => id !== movieId)]
          : current.filter((id) => id !== movieId));
      } else {
        await queryClient.invalidateQueries({ queryKey: listKey });
      }
    },
  });
}
