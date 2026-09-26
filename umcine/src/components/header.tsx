import "./header.css";

function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left-group">
          <div className="header__left">
            <img src="/icons/movie.svg" alt="UMCine 로고" className="header__logo-icon" />
            <span className="header__logo-text">UMCine</span>
          </div>

          <nav className="header__nav">
            <a href="#" className="header__nav-item header__nav-item--active">영화</a>
            <a href="#" className="header__nav-item">검색</a>
            <a href="#" className="header__nav-item">내 정보</a>
          </nav>
        </div>

        <div className="header__right">
          <img src="/icons/search.svg" alt="검색" className="header__search-icon" />
          <button className="header__mypage-button">마이페이지</button>
        </div>
      </div>
    </header>
  );
}

export default Header;