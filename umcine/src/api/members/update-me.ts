import { authApi } from "@/api/auth-api";
import type { ApiResponse } from "@/api/api-response";
import type { MemberInfo } from "@/api/members/me";

// dto/MemberUpdateRequest.java
export interface UpdateMeRequest {
  nickname: string;
}

export function updateMe(body: UpdateMeRequest) {
  return authApi.patch("members/me", { json: body }).json<ApiResponse<MemberInfo>>();
}
