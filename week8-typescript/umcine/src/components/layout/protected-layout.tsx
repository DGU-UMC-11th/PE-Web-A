import { Outlet } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";
import { useMe } from "../../hooks/use-account";

export function ProtectedLayout() {
  const { accessToken } = useAuthStore();
  const me = useMe();
  if (!accessToken) return <p className="p-8">로그인이 필요해요. <a href="/login">로그인</a></p>;
  if (me.isPending) return <p role="status" className="p-8">내 정보를 불러오는 중이에요.</p>;
  if (me.isError) return <p role="alert" className="p-8">내 정보를 불러오지 못했어요. <button onClick={() => void me.refetch()}>다시 시도</button></p>;
  return <Outlet />;
}
