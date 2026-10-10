export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200">
      <div className="mx-auto flex max-w-290 items-center justify-end gap-2 px-6 py-4">
        <img className="h-3.5 w-auto" src="/images/logos/tmdb-logo.svg" alt="TMDB 로고" />
        <p className="text-xs text-gray-500">
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a
            className="text-blue-600 underline"
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
