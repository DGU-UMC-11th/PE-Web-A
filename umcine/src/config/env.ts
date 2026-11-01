const tmdbApiBaseUrl = import.meta.env.VITE_TMDB_API_BASE_URL;
const tmdbAccessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

if (!tmdbApiBaseUrl || !tmdbAccessToken) {
  console.log("API URL:", tmdbApiBaseUrl);
  console.log("토큰 존재 여부:", Boolean(tmdbAccessToken));
  throw new Error("TMDB 환경 변수가 필요해요.");
}


export const env = {
  tmdbApiBaseUrl,
  tmdbAccessToken,
};