import { apiClient } from "../api-client";
import { authApi } from "../auth-api";

interface Response<T> { isSuccess: boolean; message: string; result: T }
export interface MemberInfo { email: string; nickname: string; createdAt: string }
export interface Favorite { favoriteId: number; movieId: number; createdAt: string }
export interface Rating { ratingId: number; movieId: number; score: number; comment: string | null }

export const login = (body: { email: string; password: string }) =>
  apiClient.post("auth/login", { json: body }).json<Response<{ nickname: string; accessToken: string }>>();
export async function getMe() {
  return (await authApi.get("members/me").json<Response<MemberInfo>>()).result;
}
export async function updateMe(body: { nickname: string }) {
  return (await authApi.patch("members/me", { json: body }).json<Response<MemberInfo>>()).result;
}
export async function getFavorites() {
  return (await authApi.get("favorites").json<Response<Favorite[]>>()).result;
}
export async function getFavorite(movieId: number) {
  return (await authApi.get(`favorites/${movieId}`).json<Response<{ isFavorite: boolean }>>()).result;
}
export const addFavorite = (movieId: number) => authApi.post("favorites", { json: { movieId } }).json();
export const removeFavorite = (movieId: number) => authApi.delete(`favorites/${movieId}`).json();
export const getRatings = (memberId: number) => apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
export const createRating = (body: { movieId: number; score: number; comment: string }) =>
  authApi.post("ratings", { json: body }).json();
export const updateRating = (id: number, body: { score: number; comment: string }) =>
  authApi.patch(`ratings/${id}`, { json: body }).json();
export const deleteRating = (id: number) => authApi.delete(`ratings/${id}`).json();
