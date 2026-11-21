import { useAuthStore } from "@/stores/auth-store";
import { getMemberIdFromToken } from "@/utils/auth/get-member-id-from-token";

// 저장된 토큰에서 꺼낸 내 memberId (로그인 전이면 null)
export function useMemberId() {
  return useAuthStore((state) => getMemberIdFromToken(state.accessToken));
}
