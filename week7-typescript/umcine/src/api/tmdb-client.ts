import ky from "ky";
import { getTmdbEnv } from "../config/env";

export const tmdbClient = ky.create({
  baseUrl: `${(import.meta.env.VITE_TMDB_API_BASE_URL || "https://api.themoviedb.org/3").replace(/\/+$/, "")}/`,
  // HTTP 재시도는 TanStack Query에서 한 번만 관리해요.
  retry: 0,
  hooks: {
    // 요청 시 검사하여 환경 변수가 없어도 오류 안내 화면을 렌더링해요.
    beforeRequest: [({ request }) => {
      const { tmdbAccessToken } = getTmdbEnv();
      request.headers.set("Authorization", `Bearer ${tmdbAccessToken}`);
    }],
  },
});
