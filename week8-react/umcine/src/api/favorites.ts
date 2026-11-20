import { authApi, readResult, readWriteResponse } from './api-client';

// 서버 명세 확정 전 계약: 공통 응답 result가 목록은 Favorite[], 단건은 { isFavorite }이다.
export interface Favorite { favoriteId?: number; movieId: number }
export const getFavorites = (signal?: AbortSignal) => readResult<Favorite[]>(authApi.get('favorites', { signal }));
export const getFavorite = (movieId: number, signal?: AbortSignal) =>
  readResult<{ isFavorite: boolean }>(authApi.get(`favorites/${movieId}`, { signal }));
/** DELETE의 204 응답은 JSON으로 읽지 않는다. */
export async function setFavorite(movieId: number, active: boolean) {
  const response = active
    ? authApi.post('favorites', { json: { movieId } })
    : authApi.delete(`favorites/${movieId}`);
  await readWriteResponse(response);
}

