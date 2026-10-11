# UMCine — 4주차 필수 미션

3주차 프로젝트를 복사하여 목록·검색·상세의 북마크를 Zustand와 localStorage로 공유합니다.

## 실행

```bash
pnpm install
pnpm dev
```

검증: `pnpm build`, `pnpm lint`

## 핵심 구현

- `src/stores/bookmark-store.ts`: 북마크 ID 배열과 추가·제거 action. persist의 key는 `umcine-bookmark-store`이며 partialize로 ID 배열만 저장합니다.
- `src/components/movies/bookmark-button.tsx`: 세 화면이 공유하는 버튼. selector로 해당 영화의 상태와 action만 구독합니다.
- 영화 데이터에서 초기 북마크를 제거하여 저장값이 없으면 빈 배열로 시작합니다.
- 복원 시 양의 안전한 정수만 남기고 중복을 제거합니다. 잘못된 JSON은 초기 빈 상태를 유지하며, 저장소 접근 실패 시 현재 앱의 메모리 상태로 동작합니다.

## 확인 절차

1. 목록에서 북마크를 추가하고 같은 영화의 상세·검색에서 활성 상태를 확인합니다.
2. 검색 또는 상세에서 해제하고 목록에 반영되는지 확인합니다.
3. 새로고침 후에도 상태가 유지되는지 확인합니다.
4. 개발자 도구 Application → Local storage에서 현재 origin의 `umcine-bookmark-store`를 확인합니다.
5. 일반 브라우저를 완전히 종료했다가 같은 주소로 다시 열어 유지 여부를 확인합니다.
6. 해당 key만 삭제한 후 새로고침하면 모든 북마크가 해제됩니다. 실행 중인 메모리 상태는 key 삭제만으로 즉시 바뀌지 않습니다.

저장 예: `{"state":{"bookmarkedMovieIds":[1,2]},"version":0}`

호스트와 포트가 바뀌면 별도 저장소를 사용합니다. 다른 기기 또는 다른 브라우저와 동기화하지 않습니다.

## 검증 결과

- pnpm build / pnpm lint 통과
- 브라우저: 목록 → 상세 → 검색 상태 공유, 검색에서 해제, 새로고침 유지 확인
- 별도 메모리 저장소 검사: 추가·제거, ID만 저장, 새 store 복원, 잘못된 ID·JSON, key 삭제 후 빈 상태 통과
- 사용자 브라우저의 Application 패널과 완전 종료·재실행 확인은 제출 전 직접 진행합니다.
