import { apiClient } from "@/api/api-client";
import { useAuthStore } from "@/stores/auth-store";

// 로그인이 필요한 요청에 쓰는 인스턴스. 저장된 토큰을 Authorization 헤더에 붙인다.
export const authApi = apiClient.extend({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        // 토큰이 없거나 만료되어 401을 받으면 저장된 토큰을 지운다.
        if (response.status === 401) {
          useAuthStore.getState().setAccessToken(null);
        }
      },
    ],
  },
});
