import { mutationOptions, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { signup } from "../api/members/signup";
import { useProfileStore } from "../stores/profile-store";

const signupMutationOptions = mutationOptions({ mutationFn: signup });

export function useSignupMutation() {
  const navigate = useNavigate();
  const setMember = useProfileStore((state) => state.setMember);

  return useMutation({
    ...signupMutationOptions,
    onSuccess: (response) => {
      if (!response.isSuccess) {
        alert(response.message);
        return;
      }

      const { email, nickname } = response.result;
      setMember({ email, nickname });
      alert(response.message);
      void navigate({ to: "/login" });
    },
    onError: () => {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
