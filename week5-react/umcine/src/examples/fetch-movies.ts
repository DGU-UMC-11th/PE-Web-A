import { getMoviesWithFetch } from '../api/movies/get-movies-with-fetch';
// 개발 중에만 main.tsx에서 임시 import하여 Network를 확인한 뒤 제거한다.
getMoviesWithFetch(1).then(response => console.log(response.results)).catch(error => console.error(error));
