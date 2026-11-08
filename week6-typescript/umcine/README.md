# UMCine · 6주차 TanStack Query

5주차의 TMDB API 함수를 재사용하고 목록·검색·상세의 useEffect와 서버 데이터용 useState를 TanStack Query v5로 교체했습니다. 기존 라우팅, URL 페이지 번호, Zustand 북마크, TMDB 출처 표기를 유지합니다.

## 실행

```bash
pnpm install
cp .env.example .env.local
# VITE_TMDB_ACCESS_TOKEN에 TMDB API Read Access Token 입력
pnpm dev
```

기존 week5의 `.env.local`이 있으면 해당 값을 week6에 복사해도 됩니다. 환경 변수 변경 시 개발 서버를 재시작합니다. `.env.local`은 Git에서 제외되며, VITE_ 값은 클라이언트 빌드에 포함됩니다.

```bash
pnpm test
pnpm lint
pnpm build
```

## 구현

- `src/config/query-client.ts`: 전역 staleTime 60초, gcTime 5분, 재시도 1회.
- `src/main.tsx`: QueryClientProvider와 개발 모드에서만 표시하는 ReactQueryDevtools.
- `src/queries/movies/movie-queries.ts`: 선택 미션 queryOptions. 목록은 page, 검색은 trim한 query와 page, 상세는 영화 ID를 key에 포함합니다. 상세 staleTime은 30초입니다.
- `src/pages/movies`: useQuery의 상태와 data, refetch를 기존 UI에 연결합니다. 빈 검색어와 잘못된 상세 ID는 enabled로 자동 요청을 막습니다.
- `src/components/movies/query-feedback.tsx`: 백그라운드 갱신과 오프라인 대기, 캐시가 있는 재조회 실패 안내. 캐시 데이터는 유지합니다.
- ky의 retry는 0으로 설정하고 재시도는 Query에서 관리하여 두 계층의 재시도가 중첩되지 않도록 했습니다.

## 제출 자료

**[docs/mission-record.md](docs/mission-record.md)의 ‘필수 미션’과 ‘선택 미션’을 개인 Notion 워크북에 그대로 복사하면 됩니다.** 같은 파일에 핵심 키워드, 후기 초안, 실제 트러블 슈팅, 증빙 파일 목록도 정리했습니다.

증빙은 `docs/evidence/`에 있습니다. 토큰이나 인증 header가 포함된 Network 캡처는 올리지 마세요.

## 검증 범위

- `pnpm test`: 11개 통과. 1→2→1 재사용, 검색어·페이지별 분리, 빈 검색어와 잘못된 ID의 요청 차단, 30초 stale, 1분 재조회, 5분 gc, 실패 후 refetch 복구.
- 실제 브라우저 + 실제 TMDB: 목록·검색·상세·빈 결과·잘못된 ID·404 UI 확인. Devtools에서 상세 fresh→stale 전환과 동일한 Last Updated 확인.
- 실제 요청 audit: 임시 로컬 프록시로 TMDB 응답을 수정 없이 전달하고 경로·상태·소요 시간만 기록. 1→2→1에서 HTTP 200 2회, 1페이지 복귀 시 추가 요청 없음. `network-cache.json` 참고. 일반 실행에서는 TMDB를 직접 호출하며 프록시 코드는 프로젝트에 포함하지 않습니다.
- 검증 중 브라우저 Console error/warn 로그 없음. 의도적으로 만든 404의 HTTP 실패는 정상적인 오류 처리 확인입니다.
- `pnpm lint`, `pnpm build` 통과.

## 직접 재현

1. 개발 서버를 켜고 브라우저 DevTools의 Network에서 `popular`로 필터링합니다. 캐시 비교 중에는 새로고침하지 않습니다.
2. 목록 1페이지 로딩 후 2페이지, 1페이지로 1분 안에 이동합니다. 1페이지로 돌아올 때 요청이 추가되지 않는지 확인합니다.
3. 오른쪽 아래 Query Devtools를 열어 list page 1·2 key가 분리돼 있는지 확인합니다. 페이지 버튼이 패널에 가려지면 Devtools를 닫고 이동합니다.
4. 상세를 연 뒤 Devtools에서 detail key를 선택합니다. 30초 후 fresh→stale로 바뀌지만 데이터와 Last Updated는 유지됩니다. stale 자체가 즉시 재요청하는 타이머는 아닙니다.
5. 검색어와 검색 페이지를 바꾸어 별도 key를 확인합니다. 빈 검색어는 disabled이며 isPending=true여도 실제 요청 중이 아니므로 isLoading=false입니다.
6. 화면을 떠나면 inactive가 되고, 그 상태로 gcTime이 지나면 캐시가 제거됩니다. 자동 테스트는 fake timer로 이를 검증합니다.
7. 새로고침하면 메모리 Query 캐시는 새로 만들어집니다. localStorage에 저장하는 북마크와 구분하세요.

## 공식 자료

- [워크북](https://makeus-challenge.notion.site/6-TanStack-Query-4a3b57f4596b82609bda81e7d45db379)
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)
- [Disabling Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
