/** 영화 목록 페이지의 공통 헤더를 표시한다. */
export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="./" aria-label="UMCine 홈">
          <img src="/icons/movie.svg" alt="" />UMCine
        </a>
        <nav className="main-nav" aria-label="주 메뉴">
          <a href="#movie-list" aria-current="page">영화</a>
          <button type="button" disabled title="다음 주차에 구현 예정">검색</button>
          <button type="button" disabled title="다음 주차에 구현 예정">내 정보</button>
        </nav>
        <div className="header-actions">
          <button className="search-button" type="button" aria-label="검색 (준비 중)" disabled>
            <img src="/icons/search.svg" alt="" />
          </button>
          <button className="login-button" type="button" disabled title="다음 주차에 구현 예정">로그인</button>
        </div>
      </div>
    </header>
  );
}
