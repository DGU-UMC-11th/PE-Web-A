import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getMe, login, updateMe } from "../api/members/account-api";
import { signup } from "../api/members/member-api";
import { useAuthStore } from "../stores/auth-store";

export function useMe() {
  const { accessToken, session } = useAuthStore();
  return useQuery({
    queryKey: ["members", "me", session], queryFn: getMe,
    enabled: !!accessToken, staleTime: 5 * 60 * 1000, retry: false,
  });
}
export function useLoginMutation() {
  const client = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      useAuthStore.getState().setAccessToken(response.result.accessToken);
      await client.invalidateQueries({ queryKey: ["members", "me"] });
      await navigate({ to: "/", search: { page: 1 } });
    },
  });
}
export function useSignupMutation() {
  const navigate = useNavigate();
  return useMutation({ mutationFn: signup, onSuccess: () => { void navigate({ to: "/login" }); } });
}
export function useUpdateMeMutation() {
  const client = useQueryClient();
  const session = useAuthStore((state) => state.session);
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (member) => client.setQueryData(["members", "me", session], member),
  });
}
