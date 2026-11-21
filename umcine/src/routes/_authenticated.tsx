import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { useAuthStore } from "@/stores/auth-store";

/**
 * 로그인 전용 페이지를 묶는 pathless layout route.
 * "_"로 시작해 URL에는 나타나지 않으므로 하위 페이지는 /my, /my/edit 그대로 쓴다.
 */
export const Route = createFileRoute("/_authenticated")({
  // 로그인하지 않았다면 하위 페이지를 그리기 전에 로그인 화면으로 보낸다.
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});
