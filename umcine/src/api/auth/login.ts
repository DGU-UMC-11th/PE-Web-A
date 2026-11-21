import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/api/api-response";

export interface LoginRequest {
  email: string;
  password: string;
}

// dto/LoginResponse.java
export type LoginResponse = ApiResponse<{
  nickname: string;
  accessToken: string;
}>;

// 로그인은 토큰이 필요 없으므로 apiClient를 쓴다.
export function login(body: LoginRequest) {
  return apiClient.post("auth/login", { json: body }).json<LoginResponse>();
}
