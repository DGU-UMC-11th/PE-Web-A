import { Link } from "@tanstack/react-router";

export function Header() {
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
        <button
          type="button"
          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium"
        >
          로그인
        </button>
      </div>
    </header>
  );
}