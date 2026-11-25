import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";

// dto/MemberInfoResponse.java (memberId는 응답에 없음)
export interface MemberInfo {
  email: string;
  nickname: string;
  createdAt: string;
}

export async function getMe() {
  const response = await authApi.get("members/me").json<ApiResponse<MemberInfo>>();
  return response.result;
}
