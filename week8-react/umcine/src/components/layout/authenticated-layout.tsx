import { Navigate, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/auth-store';

/** 화면 사용 중 인증이 만료되면 보호된 하위 화면을 숨기고 로그인으로 이동한다. */
export function AuthenticatedLayout() {
  const token = useAuthStore(state => state.accessToken);
  return token ? <Outlet /> : <Navigate to="/login" />;
}
