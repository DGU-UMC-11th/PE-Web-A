const tmdbApiBaseUrl = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL;
const tmdbAccessToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export const env = {
  tmdbApiBaseUrl,
  tmdbAccessToken,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
};