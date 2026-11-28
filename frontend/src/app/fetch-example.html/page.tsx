import type { Metadata } from "next";
import { FetchMoviesStatus } from "../../examples/fetch-movies";

export const metadata: Metadata = { title: "TMDB fetch 예제" };

export default function Page() {
  return (
    <main>
      <h1>인기 영화 fetch 요청</h1>
      <p>개발자 도구의 Network 패널을 열고 새로고침한 다음 movie/popular 요청의 상태 코드와 Response를 확인하세요.</p>
      <FetchMoviesStatus />
    </main>
  );
}
