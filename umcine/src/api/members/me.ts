import { authApi } from "../auth-api";

export const meQueryKey = ["members", "me"] as const;

export interface MemberInfo {
  email: string;
  nickname: string;
  createdAt: string;
}

interface MeResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: MemberInfo;
}

export async function getMe(): Promise<MemberInfo> {
  const response = await authApi.get("members/me").json<MeResponse>();
  return response.result;
}
