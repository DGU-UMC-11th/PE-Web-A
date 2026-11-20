import { authApi, readResult, readWriteResponse } from './api-client';

export interface Rating { ratingId: number; movieId: number; score: number; comment: string | null; createdAt: string; updatedAt: string }
export interface RatingInput { score: number; comment: string }
export const getRatings = (memberId: number, signal?: AbortSignal) =>
  readResult<Rating[]>(authApi.get(`members/${memberId}/ratings`, { signal }));
export const createRating = (body: RatingInput & { movieId: number }) => readWriteResponse(authApi.post('ratings', { json: body }));
export const updateRating = (ratingId: number, body: RatingInput) => readWriteResponse(authApi.patch(`ratings/${ratingId}`, { json: body }));
export const deleteRating = (ratingId: number) => readWriteResponse(authApi.delete(`ratings/${ratingId}`));
