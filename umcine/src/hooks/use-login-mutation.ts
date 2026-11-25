import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "@/api/auth/login";
import { FAVORITE_QUERY_KEYS } from "@/hooks/use-favorites-query";
import { ME_QUERY_KEY } from "@/hooks/use-me-query";
import { RATING_QUERY_KEYS } from "@/hooks/use-member-ratings-query";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.result.accessToken);
      alert("로그인에 성공했어요.");
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      // 다른 계정으로 다시 로그인한 경우 이전 계정의 즐겨찾기·평점 캐시를 쓰지 않도록 한다.
      queryClient.invalidateQueries({ queryKey: FAVORITE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RATING_QUERY_KEYS.all });
      navigate({ to: "/" });
    },
    onError: () => {
      alert("로그인에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
