/**
 * TMDB 출처 표기를 보여주는 하단 푸터
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-white">
      <div className="mx-auto flex h-[57px] max-w-[1440px] items-center justify-end gap-2 px-4 lg:px-20">
        <img src="/images/logos/tmdb-logo.svg" alt="" className="h-3 w-auto" />
        <p className="text-xs/[14px] text-muted">
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline">
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
