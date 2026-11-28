import ky from "ky";
import { env } from "../config/env";

const tmdbClient = ky.create({
  baseUrl: env.tmdbApiBaseUrl ? `${env.tmdbApiBaseUrl}/` : undefined,
  headers: { Authorization: `Bearer ${env.tmdbAccessToken ?? ""}` },
});

export function getTmdbClient() {
  if (!env.tmdbApiBaseUrl || !env.tmdbAccessToken) {
    throw new Error("TMDB 환경 변수가 필요해요.");
  }
  return tmdbClient;
}
