import { useQuery } from "@tanstack/react-query";
import { getMe, meQueryKey } from "../api/members/me";
import { useAuthStore } from "../stores/auth-store";

export function useMeQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return { accessToken, meQuery };
}
