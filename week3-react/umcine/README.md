# UMCine — 3주차 필수 미션

React + TypeScript 영화 목록을 TanStack Router의 파일 기반 라우팅과 Tailwind CSS로 확장했습니다.

## 실행

```bash
pnpm install
pnpm dev
```

검증 명령은 `pnpm build`, `pnpm lint`입니다. 빌드 과정에서는 Vite가 라우트 트리를 생성한 뒤 TypeScript 타입 검사를 실행합니다.

## 화면과 기능

- `/`: 영화 10편 목록, 영화별 북마크, 상세 페이지 이동
- `/search`: 검색 전 안내
- `/search?query=스파이더맨`: 제목·원제로 검색, 검색 결과 수와 영화 정보 표시
- `/movies/1`: URL의 영화 ID에 해당하는 상세 정보
- 존재하지 않는 영화 ID: “영화를 찾을 수 없어요.” 안내

검색어의 앞뒤 공백과 영문 대소문자를 정규화합니다. URL에 검색어를 저장하므로 직접 접속, 새로고침, 뒤로가기에서도 검색 결과를 복원합니다. 북마크는 공통 레이아웃의 React 상태로 관리하여 페이지 이동 중 유지하고, 새로고침하면 더미 데이터의 초기 상태로 돌아갑니다.

## 구조

- `src/routes`: 라우트와 검색 파라미터 검증
- `src/pages/movies`: 목록·검색·상세 화면
- `src/components/layout`: 공통 헤더와 레이아웃, 북마크 상태 제공
- `src/components/movies`: 영화 카드·그리드·페이지 표시·공유 상태 훅
- `src/data`, `src/types`: 영화 더미 데이터와 타입
- `src/utils/cn.ts`: 조건부 Tailwind 클래스 병합

`src/routeTree.gen.ts`는 라우터 플러그인의 자동 생성 파일이므로 직접 수정하지 않습니다.

Figma의 데스크톱 화면 배치를 참고했습니다. 로그인·내 정보는 비활성 상태이며 실제 API 연결은 포함하지 않습니다.
