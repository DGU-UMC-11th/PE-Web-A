export default function Header() {
    return (
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-badge">UM</span>
            <span>UMCine</span>
          </div>
          <nav className="nav-menu">
            <span className="active">영화</span>
            <span>검색</span>
            <span>내 정보</span>
          </nav>
        </div>
        <div className="header-right">
          <button className="search-btn" aria-label="검색" type="button">
            <img src="/icons/search.svg" alt="검색" />
          </button>
          <button className="login-btn" type="button">로그인</button>
        </div>
      </header>
    );
  }