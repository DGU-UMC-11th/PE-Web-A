import { Link, useParams } from "@tanstack/react-router";
import { Icon } from "../../components/common/icon";
import { movies } from "../../data/movies";

const ratingScores = [1, 2, 3, 4, 5];

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));

  if (!movie) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 text-muted lg:px-20">
        영화를 찾을 수 없어요.
      </main>
    );
  }

  return (
    <main>
      <section
        className="relative h-[300px] w-full bg-cover bg-center sm:h-[360px]"
        style={{ backgroundImage: `url(${movie.backdropPath})` }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-4 py-6 lg:px-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1 self-start text-[13px]/4 font-bold text-white"
          >
            <Icon name="chevron-left" className="size-6 text-white" />
            영화 목록
          </Link>

          <div className="flex w-[800px] max-w-full flex-col gap-2">
            <h1 className="text-[30px]/[36px] font-bold tracking-[-1.2px] break-keep text-white sm:text-[46px]/[50px] sm:tracking-[-2.3px]">{movie.title}</h1>
            <p className="text-sm/[17px] text-white">{movie.originalTitle}</p>
            <p className="flex flex-wrap gap-2 text-[13px]/4 font-bold text-white">
              <span>{movie.releaseDate}</span>
              <span>{movie.genres.join(" · ")}</span>
              <span>{movie.runtime}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start lg:px-20">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="h-[286px] w-[200px] shrink-0 rounded-[10px] object-cover shadow-[0_12px_30px_rgba(12,15,20,0.12)]"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h2 className="text-[21px]/[25px] font-bold tracking-[-0.63px] break-keep text-ink">{movie.tagline}</h2>
          <p className="text-sm/6 text-muted">{movie.overview}</p>
          <button
            type="button"
            className="inline-flex h-[42px] w-[107px] cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-white bg-brand text-sm/[17px] font-extrabold text-white"
          >
            <Icon name="bookmark" className="size-4 text-white" />
            즐겨찾기
          </button>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-2 border-line pb-[41px] lg:w-[360px] lg:border-l lg:pl-[30px]">
          <h2 className="text-[21px]/[25px] font-bold tracking-[-0.63px] text-ink">내 평점</h2>
          <p className="text-xs/[14px] text-subtle">별점은 필수, 후기는 선택이에요.</p>
          <div className="flex gap-1">
            {ratingScores.map((score) => (
              <button
                key={score}
                type="button"
                aria-label={`${score}점`}
                className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white"
              >
                <Icon name="star" className="size-6 text-muted" />
              </button>
            ))}
          </div>
          <textarea
            aria-label="후기"
            placeholder="영화를 보고 느낀 점을 남겨보세요."
            className="h-[102px] w-full resize-none rounded-lg border border-line bg-white px-3 pt-4 pb-[18px] text-[13px]/5 text-ink placeholder:text-subtle"
          />
          <button
            type="button"
            className="h-[42px] w-full cursor-pointer rounded-lg border border-white bg-ink text-sm/[17px] font-extrabold text-white"
          >
            평점 저장
          </button>
        </aside>
      </div>
    </main>
  );
}
