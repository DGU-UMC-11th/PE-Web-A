import { Navigate, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

/**
 * 로그인 전용 페이지의 공통 layout. 하위 페이지를 <Outlet />으로 그린다.
 */
export function AuthenticatedLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);

  // 페이지를 보는 중 401로 토큰이 지워지면 beforeLoad가 다시 돌지 않으므로 여기서도 막는다.
  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
