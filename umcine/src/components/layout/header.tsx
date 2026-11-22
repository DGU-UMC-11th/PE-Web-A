import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";

export function Header() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <header className="flex items-center justify-between border-b px-6 py-3 bg-white">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-bold">
          UMCine
        </Link>
        <Link to="/" className="text-sm text-gray-600">
          영화
        </Link>
        <Link to="/search" className="text-sm text-gray-600">
          검색
        </Link>
      </div>
      <div>
        {!accessToken ? (
          <Link
            to="/login"
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium"
          >
            로그인
          </Link>
        ) : meQuery.isLoading ? (
          <span className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
        ) : (
          <Link
            to="/mypage"
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium"
          >
            마이페이지
          </Link>
        )}
      </div>
    </header>
  );
}