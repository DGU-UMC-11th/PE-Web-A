import { mutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { login } from "../api/auth/login";
import { useAuthStore } from "../stores/auth-store";

const loginMutationOptions = mutationOptions({ mutationFn: login });

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    ...loginMutationOptions,
    onSuccess: (response) => {
      queryClient.removeQueries({ queryKey: ["members", "me"], exact: true });
      queryClient.removeQueries({ queryKey: ["favorites"] });
      queryClient.removeQueries({ queryKey: ["ratings"] });
      setAccessToken(response.result.accessToken);
      alert("로그인에 성공했어요.");
      navigate({ to: "/" });
    },
    onError: (error) => {
      if (error instanceof HTTPError && error.response.status === 401) {
        alert("이메일 또는 비밀번호가 올바르지 않아요.");
        return;
      }

      alert("로그인에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
