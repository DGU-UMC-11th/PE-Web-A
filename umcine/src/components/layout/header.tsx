import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header>
      <Link to="/">영화</Link>
      <Link to="/search">검색</Link>
    </header>
  );
}