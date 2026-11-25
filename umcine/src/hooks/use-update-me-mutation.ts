import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "@/api/members/update-me";
import { ME_QUERY_KEY } from "@/hooks/use-me-query";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (response) => {
      // PATCH 응답에 바뀐 내 정보가 들어 있으므로 다시 요청하지 않고 캐시를 바로 바꾼다.
      queryClient.setQueryData(ME_QUERY_KEY, response.result);
      alert("내 정보 수정에 성공했어요.");
    },
    onError: () => {
      alert("내 정보 수정에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
