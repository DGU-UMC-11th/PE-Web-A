import { apiClient } from "./api-client";
import { useAuthStore } from "../stores/auth-store";

export const authApi = apiClient.extend({
  hooks: {
    beforeRequest: [({ request }) => {
      const token = useAuthStore.getState().accessToken;
      if (token) request.headers.set("Authorization", `Bearer ${token}`);
    }],
    afterResponse: [({ request, response }) => {
      const state = useAuthStore.getState();
      if (response.status === 401 && request.headers.get("Authorization") === `Bearer ${state.accessToken}`) {
        state.setAccessToken(null);
      }
    }],
  },
});
