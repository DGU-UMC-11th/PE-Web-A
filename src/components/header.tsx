import "./header.css";


export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <button className="logo-button">
            <img
              className="header-logo"
              src="/icons/movie-icons/movie.svg"
              alt="UMCine 로고"
            />
          </button>

          <h1>UMCine</h1>

          <nav className="header-nav">
            <button className="nav-item active">영화</button>
            <button className="nav-item">검색</button>
            <button className="nav-item">내 정보</button>
          </nav>
        </div>

        <div className="header-right">
          <button className="search-button">
            <img
              className="search-icon"
              src="/icons/movie-icons/search.svg"
              alt="검색"
            />
          </button>

          <button className="mypage-button">로그인</button>
        </div>
      </div>
    </header>
  );
}