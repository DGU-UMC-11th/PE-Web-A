import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";
import { ProtectedLayout } from "../../components/layout/protected-layout";

export const Route = createFileRoute("/(auth)/_protected")({
  beforeLoad: () => { if (!useAuthStore.getState().accessToken) throw redirect({ to: "/login" }); },
  component: ProtectedLayout,
});
