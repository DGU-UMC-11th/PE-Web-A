# UMCine — 5주차 TMDB API 미션

4주차 프론트 코드의 복사본에서 로컬 영화 데이터를 TMDB API로 교체했습니다. 현재 복사 기준은 로컬 `seop/#46`의 저장된 코드입니다. 개인 기본 브랜치 최신화 후 4주차 머지 결과에 추가 변경이 있는지 확인해야 합니다.

## 준비 및 실행

`.env.local`에 아래 값을 설정합니다. `.env.example`은 공유용이며 실제 토큰은 넣지 않습니다.

```dotenv
VITE_TMDB_API_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_ACCESS_TOKEN=발급받은_API_READ_ACCESS_TOKEN
```

```bash
pnpm install
pnpm dev
```

환경변수를 수정하면 개발 서버를 재시작합니다. VITE_ 값은 브라우저에 공개되므로 비밀 저장소가 아닙니다. `.env.local`은 Git에서 제외합니다.

## 구현

- `src/config/env.ts`: 환경변수 관리. 요청 시 검증하여 누락 안내를 화면에 표시
- `src/api/tmdb-client.ts`: ky 2.x 공통 baseUrl·Bearer 인증
- `src/api/movies`: 순수 fetch 예제, 인기 목록·검색·상세 API, 응답 타입
- `src/pages/movies`: useState/useEffect와 Promise로 로딩·오류·빈 결과·성공 구분
- 검색어가 비어 있거나 영화 ID가 잘못된 경우 요청 생략
- cleanup의 ignore와 AbortController로 늦게 도착한 응답 차단
- null 이미지 경로 및 이미지 로딩 실패 시 같은 크기의 '이미지 없음' 영역
- 상세의 장르·상영 시간·태그라인·줄거리·배경은 API 응답 사용
- TMDB 로고와 출처 문구 유지
- 북마크는 TMDB ID만 저장. persist version 1로 변경하여 이전 더미 ID는 초기화
- 필수 범위에 맞춰 목록과 검색은 첫 페이지를 표시. 다음 페이지 및 재시도 버튼은 추가하지 않음

## 순수 fetch 실습 (토큰 설정 후)

1. `src/main.tsx`에 `import './examples/fetch-movies';`를 임시로 추가합니다.
2. 개발자 도구 Network를 열고 새로고침합니다.
3. 인기 영화 요청의 URL, language=ko-KR, page=1, Status 200과 Response.results를 확인합니다.
4. 예제 import를 제거합니다. 화면의 ky 요청과 함께 나타나므로 Initiator에서 fetch 예제를 구분합니다.
5. 인증 header가 포함된 화면을 공유할 때 토큰을 가립니다.

## 최종 확인 목록

- `/`: 실제 인기 영화, 로딩 후 성공
- `/search`: 빈 검색어 안내, 검색 API 요청 없음
- `/search?query=인셉션`: 실제 검색 결과·전체 결과 수·상세 이동
- 검색 결과가 없는 검색어: 빈 결과 안내
- 실제 카드의 `/movies/{id}`: 상세 정보, 직접 접속·새로고침
- `/movies/invalid`, `/movies/0`: 올바르지 않은 영화 번호 안내
- 존재하지 않는 양의 정수 ID: API 404 → 영화를 찾을 수 없어요.
- 인증 실패·네트워크 실패: 오류 안내
- Network 지연 설정으로 로딩 확인, 빠른 검색 변경으로 이전 결과 덮어쓰기 방지 확인
- 포스터·배경 null과 runtime null 처리
- 북마크 상태 공유·새로고침 유지
- Console 오류 확인 및 `pnpm build`, `pnpm lint`

## 현재 검증 범위

- build / lint 통과
- 브라우저에서 환경변수 누락 안내, 빈 검색어 안내, 잘못된 영화 ID 안내 확인
- 토큰 미발급으로 실제 TMDB 응답, 순수 fetch Network, 인증된 화면의 최종 검증은 아직 진행하지 못함

## 공식 자료

- [ky](https://github.com/sindresorhus/ky)
- [TMDB 검색과 상세](https://developer.themoviedb.org/docs/search-and-query-for-details)
