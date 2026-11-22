import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meQueryKey, type MemberInfo } from "../api/members/me";
import { updateMe } from "../api/members/update-me";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Parameters<typeof updateMe>[0]) => {
      const response = await updateMe(body);
      if (!response.isSuccess || !response.result) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: meQueryKey });
      queryClient.setQueryData<MemberInfo>(meQueryKey, response.result);
      alert("내 정보 수정에 성공했어요.");
    },
    onError: () => {
      alert("내 정보 수정에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
