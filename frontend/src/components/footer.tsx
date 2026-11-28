import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <img
            className="tmdb-logo"
            src="/images/logos/tmdb-logo.svg"
            alt="TMDB"
          />

          <p className="footer-text">
            This product uses the TMDB API but is not endorsed or certified by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
            >
              TMDB
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}