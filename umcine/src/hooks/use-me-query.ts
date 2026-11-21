import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/members/me";
import { useAuthStore } from "@/stores/auth-store";

export const ME_QUERY_KEY = ["members", "me"] as const;

// 헤더, 내 정보, 내 정보 수정 화면이 같은 queryKey와 옵션으로 캐시를 공유한다.
export function useMeQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
