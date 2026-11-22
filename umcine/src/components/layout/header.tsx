import { Link } from "@tanstack/react-router";
import { useMeQuery } from "../../hooks/use-me-query";

export function Header() {
  const { accessToken, meQuery } = useMeQuery();

  return (
    <header>
      <Link to="/">영화</Link>
      <Link to="/search">검색</Link>
      {!accessToken ? (
        <Link to="/login">로그인</Link>
      ) : meQuery.isLoading ? (
        <span
          role="status"
          aria-label="내 정보 불러오는 중"
          className="inline-block h-10 w-24 animate-pulse rounded-lg bg-gray-200"
        />
      ) : (
        <Link to="/mypage">마이페이지</Link>
      )}
    </header>
  );
}
