import { getMoviesWithFetch } from "../api/movies/get-movies-with-fetch";

getMoviesWithFetch(1)
  .then((response) => {
    console.log(response.results);
    const status = document.getElementById("fetch-status");
    if (status) status.textContent = `인기 영화 ${response.results.length}편을 받았어요.`;
  })
  .catch(() => {
    const status = document.getElementById("fetch-status");
    if (status) status.textContent = "영화 목록 요청에 실패했어요. Network 패널을 확인하세요.";
  });
