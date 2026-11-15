# 6주차 미션 제출 자료

아래 ‘필수 미션’과 ‘선택 미션’은 Notion 워크북의 같은 이름 토글에 복사할 내용입니다. 사진은 본인의 스터디 인증샷을 따로 첨부하세요.

## 필수 미션

### 수행 내용

5주차에서 useEffect와 useState로 관리하던 목록·검색·상세 API 요청을 TanStack Query의 useQuery로 변경했다. API 요청 함수는 유지하고 서버 데이터와 요청 상태는 Query가 관리하도록 했다. 영화 페이지 번호와 검색어는 URL로 관리하고, 북마크는 기존 Zustand store에서 영화 ID로 관리한다.

### 주요 코드 1 — 공통 캐시 설정과 Provider

```tsx
// src/config/query-client.ts
export const ONE_MINUTE = 60 * 1000;
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE,
      gcTime: 5 * ONE_MINUTE,
      retry: 1,
    },
  },
});

// src/main.tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
</QueryClientProvider>
```

QueryClient를 컴포넌트 외부에서 한 번 생성하여 렌더링마다 캐시가 초기화되지 않도록 했다. 전역 staleTime은 1분, gcTime은 5분으로 설정했다.

### 주요 코드 2 — 요청별 query key와 조건부 요청

```tsx
// src/queries/movies/movie-queries.ts
export const movieQueries = {
  list: (page: number) => queryOptions({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  }),
  search: (query: string, page: number) => {
    const normalizedQuery = query.trim();
    return queryOptions({
      queryKey: ["movies", "search", { query: normalizedQuery, page }],
      queryFn: () => searchMovies({ query: normalizedQuery, page }),
      enabled: normalizedQuery.length > 0,
    });
  },
  detail: (movieId: number) => queryOptions({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
    staleTime: 30 * 1000,
  }),
};
```

목록·검색·상세를 서로 구분하고, 응답에 영향을 주는 page·검색어·영화 ID를 key에 넣었다. 공백을 제거한 검색어가 없거나 영화 ID가 올바르지 않으면 자동 요청하지 않는다. 상세는 전역 기본값 대신 staleTime 30초를 적용했다.

### 주요 코드 3 — 기존 화면과 연결

```tsx
const moviesQuery = useQuery(movieQueries.list(page));
const movies = moviesQuery.data?.results ?? [];
const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, 500);

const searchQuery = useQuery(movieQueries.search(normalizedQuery, page));
const movieDetailQuery = useQuery(movieQueries.detail(parsedMovieId));

const refetch = () => { void moviesQuery.refetch(); };
```

기존 UI에서 목록·상세는 isPending, 검색은 빈 검색어 안내를 먼저 표시한 다음 isLoading을 사용했다. isError와 isSuccess, results의 길이로 오류·빈 결과·성공을 구분했다. 오류 시 다시 시도 버튼은 refetch를 호출한다. 백그라운드 갱신은 isFetching으로 표시하며, 캐시가 있는 재조회 실패는 기존 데이터를 유지하고 별도 안내한다.

### 최종 확인 결과

- 목록·검색·상세가 실제 TMDB 응답으로 표시됐다. ‘인셉션’ 검색과 ‘프로젝트 헤일메리’ 상세를 확인했다.
- 1→2→1페이지로 1분 안에 이동했을 때 실제 API 요청은 총 2회였다. 각 응답은 HTTP 200이었고, 돌아온 1페이지는 추가 요청 없이 캐시를 재사용했다.
- Query Devtools에서 list page 1·2, search의 query/page, detail의 영화 ID가 서로 다른 캐시로 표시됐다.
- 상세 조회 후 30초가 지나 fresh→stale로 바뀌었다. 데이터와 Last Updated는 유지됐고, stale이 되는 것만으로 즉시 재요청하지 않았다.
- 빈 검색어 안내, 검색 결과 없음, 잘못된 ID 안내, 존재하지 않는 영화의 404 안내를 확인했다.
- 빈 검색어는 isPending=true, isLoading=false이며 요청하지 않는 것을 자동 테스트로 확인했다. 0·음수·소수·NaN·Infinity ID도 자동 요청하지 않았다.
- 자동 테스트 11개, pnpm lint, pnpm build가 모두 통과했다.
- 검증 중 브라우저 Console error/warn 로그는 없었다. 의도적인 404는 HTTP 오류 UI 검증으로 구분했다.

네트워크 요청 수는 실제 TMDB에 전달하는 임시 로컬 audit 프록시로 기록했다. 응답은 변경하지 않았으며 토큰·인증 header는 기록하지 않았다. 이 기록은 브라우저 Network 패널 스크린샷과는 별도 증빙이다. 일반 앱 실행은 프록시 없이 TMDB를 직접 호출한다.

### 첨부할 증빙

- `01-list-cache.jpg`: 목록 1·2페이지의 분리된 캐시.
- `02-detail-fresh.jpg`, `03-detail-stale.jpg`: 같은 상세의 fresh→stale와 동일한 Last Updated.
- `04-search-cache.jpg`: 검색어/page별 캐시와 빈 검색어 disabled 상태.
- `05-empty-results.jpg`, `06-invalid-id.jpg`, `07-not-found.jpg`: 빈 결과·잘못된 ID·404 UI.
- `network-cache.json`: 1→2→1 실제 요청 경로와 HTTP 200 2회 기록.

## 선택 미션

queryOptions를 사용해 목록·검색·상세의 query key, query function, enabled, 개별 staleTime을 `src/queries/movies/movie-queries.ts`로 분리했다. 각 화면은 `useQuery(movieQueries.list(page))`처럼 호출한다. 요청 정의를 한곳에서 관리해 화면 코드의 반복을 줄였으며, 이후 prefetchQuery 등에서도 같은 설정을 재사용할 수 있다.

## 핵심 키워드

### query key와 요청 상태

목록·검색·상세가 같은 key를 사용하면 결과 구조와 조회 조건이 다른 요청이 하나의 캐시를 공유하게 된다. 예를 들어 검색어를 key에 넣지 않으면 검색어를 바꿔도 이전 캐시가 재사용될 수 있다. 따라서 이번 구현에서는 list/page, search/query/page, detail/movieId로 구분했다.

캐시가 없고 enabled=false이면 아직 첫 조회가 성공하거나 실패하지 않았으므로 isPending은 true일 수 있다. 하지만 요청 중이 아니어서 isFetching은 false이고, isLoading = isPending && isFetching이므로 false다. 빈 검색어와 잘못된 영화 번호를 로딩보다 먼저 구분해야 한다.

### staleTime과 gcTime

staleTime은 데이터를 성공적으로 받은 시점부터 최신으로 취급하는 시간이다. 시간이 지나면 stale이 되지만 캐시가 삭제되거나 즉시 요청되지는 않는다. 기본 설정에서는 stale인 화면을 다시 열거나 창의 가시성이 돌아오거나 네트워크가 재연결될 때 재조회할 수 있다.

gcTime은 해당 query를 사용하는 컴포넌트가 없어 inactive가 된 뒤 정리를 기다리는 시간이다. 그동안 다시 사용하지 않으면 캐시가 제거된다. 이번 구현은 1분/5분을 공통값으로 정하고, 상세는 미니 실습을 위해 staleTime을 30초로 덮어썼다.

전역값은 서비스에서 보통 허용할 데이터의 최신성과 요청 비용을 기준으로 정하고, 자주 바뀌거나 특히 최신성이 중요한 조회는 개별 설정으로 조정할 수 있다. 메모리 캐시는 새로고침 시 초기화되며, 북마크를 저장하는 localStorage와 다르다.

## 학습 후기 초안

useEffect로 요청할 때는 로딩·오류·데이터 상태와 cleanup을 각각 작성했는데, useQuery로 바꾸면서 요청 정의와 화면 표시를 분리할 수 있었다. 특히 query key는 단순한 이름이 아니라 어떤 데이터를 재사용할지 결정하는 기준이라는 점을 이해했다. staleTime이 지나도 데이터가 바로 삭제되지 않고, inactive 이후 정리는 gcTime이 담당한다는 차이를 Devtools와 테스트로 확인했다.

후기는 본인이 이해한 내용에 맞춰 검토한 뒤 사용하세요.

## 트러블 슈팅

**이슈:** Query Devtools를 연 상태에서 하단 페이지 번호를 눌렀지만 URL이 바뀌지 않았다. Console 오류 메시지는 없었다.

**원인:** 하단 고정 Devtools 패널이 페이지 번호 영역을 덮고 있었다.

**해결:** Devtools 패널을 닫고 2페이지로 이동한 다음 다시 열어 page 1·2 캐시를 확인했다.

**배운 점:** 화면 조작에 반응이 없으면 코드 오류뿐 아니라 다른 패널이 클릭 영역을 가렸는지도 실제 화면에서 확인해야 한다.

## 참고

- [워크북](https://makeus-challenge.notion.site/6-TanStack-Query-4a3b57f4596b82609bda81e7d45db379)
- [TanStack Query — Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [TanStack Query — Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)
- [TanStack Query — Disabling Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
