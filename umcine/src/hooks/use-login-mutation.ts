import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth/login";
import { meQueryKey } from "../api/members/me";
import { useAuthStore } from "../stores/auth-store";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: async (body: Parameters<typeof login>[0]) => {
      const response = await login(body);
      if (!response.isSuccess || !response.result?.accessToken) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.removeQueries({ queryKey: meQueryKey, exact: true });
      queryClient.removeQueries({ queryKey: ["favorites"] });
      queryClient.removeQueries({ predicate: ({ queryKey }) =>
        queryKey[0] === "members" && queryKey[2] === "ratings",
      });
      setAccessToken(response.result.accessToken);
      alert("로그인에 성공했어요.");
      void queryClient.invalidateQueries({ queryKey: meQueryKey });
      void navigate({ to: "/" });
    },
    onError: () => {
      alert("로그인에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
