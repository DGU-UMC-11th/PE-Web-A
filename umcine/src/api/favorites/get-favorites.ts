import { authApi } from "../auth-api"; // authApi은 로그인 토큰을 헤더에 붙여주는 함수. 로그인 토큰이 필요한 이유는 정보를 요청한 사용자가 누구인지 확인하기 위해이다. 즉 누구의 즐겨찾기를 조회해야하는지 알아내기 위해 필요한 함수.


export async function getFavorite(movieId: number): Promise<unknown> {
  const response = await authApi //async는 await를 사용할 수 있게 한다. await은 서버 응답을 받을 때까지 다음줄로 가지 않고 기다리게 하는 함수?이다.
    .get(`favorites/${movieId}`) //조회할 영화 번호를 받는 함수. ${}를 사용하면 변수값을 문자열에 넣을 수 있다. 영화번호가 1이면 GET/favorites/1로 요청함.
    .json<unknown>();//서버 응답을 JSON으로 읽음.

  return response;
}