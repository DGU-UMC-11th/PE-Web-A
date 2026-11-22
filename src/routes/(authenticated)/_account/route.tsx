import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../../../stores/auth-store";

export const Route = createFileRoute("/(authenticated)/_account")({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: AccountLayout,
});

function AccountLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
