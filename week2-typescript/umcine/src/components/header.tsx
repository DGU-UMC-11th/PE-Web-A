import "./header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left">
          <a className="header__logo" href="/">
            <svg
              className="header__logo-icon"
              width="24"
              height="24"
              viewBox="128 128 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M146 132L148 136H145L143 132H141L143 136H140L138 132H136L138 136H135L133 132H132C130.9 132 130.01 132.9 130.01 134L130 146C130 147.1 130.9 148 132 148H148C149.1 148 150 147.1 150 146V132H146Z"
                fill="currentColor"
              />
            </svg>
            <span>UMCine</span>
          </a>
          <nav className="header__nav" aria-label="주요 메뉴">
            <a className="header__nav-link header__nav-link--active" href="/">
              영화
            </a>
            <a className="header__nav-link" href="/">
              검색
            </a>
            <a className="header__nav-link" href="/">
              내 정보
            </a>
          </nav>
        </div>
        <div className="header__right">
          <button type="button" className="header__search-button" aria-label="검색">
            <svg
              width="20"
              height="20"
              viewBox="80 80 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M95.5 94H94.71L94.43 93.73C95.41 92.59 96 91.11 96 89.5C96 85.91 93.09 83 89.5 83C85.91 83 83 85.91 83 89.5C83 93.09 85.91 96 89.5 96C91.11 96 92.59 95.41 93.73 94.43L94 94.71V95.5L99 100.49L100.49 99L95.5 94ZM89.5 94C87.01 94 85 91.99 85 89.5C85 87.01 87.01 85 89.5 85C91.99 85 94 87.01 94 89.5C94 91.99 91.99 94 89.5 94Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button type="button" className="header__login-button">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
