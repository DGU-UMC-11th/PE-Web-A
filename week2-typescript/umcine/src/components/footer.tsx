import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <img
          className="footer__logo"
          src="/images/logos/tmdb-logo.svg"
          alt="TMDB 로고"
        />
        <p className="footer__text">
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
