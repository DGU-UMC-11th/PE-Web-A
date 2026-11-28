# :leaves: Web-A

DGU-UMC 11기 스터디 Web-A조

## 💻 Member

| 이름  |                   GitHub                    |
|:---:|:-------------------------------------------:|
| 이주헌 |  [wngjs8114](https://github.com/wngjs8114)  |
| 김경섭 |  [kimgs1107](https://github.com/kimgs1107)  |
| 김민범 |  [minHorang](https://github.com/minHorang)  |
| 김정석 |   [kjsk0620](https://github.com/kjsk0620)   |
| 박고은 |      [dmsrh](https://github.com/dmdrh)      |
| 전지연 | [jiyeon0220](https://github.com/jiyeon0220) |

## 📁 디렉토리 구조

- src 디렉토리를 실제 작업을 진행하는 Spring Boot의 src와 일치시켜 주세요.
- 미션 및 실습, 주차를 정확히 구분하기 위해 아래의 commit 규칙을 ‼️반드시‼️ 준수하여 commit 후 push 해 주세요.

```bash
├─.github
│  └─PULL_REQUEST_TEMPLATE
│  └─ISSUE_TEMPLATE
├─README.md
└─src
    ├─main
    │
    └─test
    │
    └─...

```

## 🎨 commit 규칙

- 해당 commit이 미션에 관한 것일 경우: "mission/#해당 주차"

```
Ex) 1주차 미션 수행 후
mission/#01
```

- 해당 commit이 실습에 관한 것일 경우: "practice/#해당 주차"

```
Ex) 2주차 실습 수행 후
practice/#02
```

- 해당 주차에 미션이나 실습이 없는 경우, 있는 주차에만 수행하시면 됩니다.

## 🌳 branch 규칙

```bash
├─main
    ├─angela/main
    │  └─angela/#1
```

1. `닉네임/main 브랜치`가 기본 브랜치로 pr 보낼 때 root 브랜치(main 브랜치)가 아닌 닉네임/main 브랜치로 올립니다.
2. 매주 워크북, 실습, 그리고 미션은 각자의 닉네임/main 브랜치를 base 브랜치로 삼아 `닉네임/이슈번호 브랜치`를 생성하여 관련 파일을 업로드합니다.
3. 모든 팀원들의 approve를 받으면, pr을 머지하고 해당 pr을 생성한 브랜치(닉네임/이슈번호 브랜치)는 삭제합니다. approve와 merge는 스터디 진행 중에 이루어집니다.

## 🔖 커밋 컨벤션

| Message  | 설명                  |
| :------: | :-------------------- |
| mission  | 미션 수행             |
| practice | 실습 수행             |
| keyword  | 키워드 정리           |
| workbook | 워크북 정리           |
|   fix    | 버그 수정             |
|   docs   | 문서 수정             |
| comment  | 주석 추가 및 변경     |
|   test   | 테스트 코드 추가      |
|  rename  | 파일 혹은 폴더명 수정 |
|  remove  | 파일 혹은 폴더 삭제   |
|  chore   | 기타 변경사항         |

## UMC 9주차 · Next.js App Router

프런트엔드 앱, 정적 파일, 패키지 설정과 워크북 예제는 `frontend/`에 있습니다. 저장소 루트에서 아래 명령을 실행합니다.

```sh
cd frontend
pnpm install
pnpm dev
```

새로 설정하는 경우 `frontend/.env.example`을 `frontend/.env.local`로 복사하고 서버 실행 전에 값을 채웁니다. 기존 Vite 환경 변수의 값은 아래 Next.js 변수로 옮깁니다.

| 기존 변수 | Next.js 변수 |
| --- | --- |
| `VITE_TMDB_API_BASE_URL` | `NEXT_PUBLIC_TMDB_API_BASE_URL` |
| `VITE_TMDB_ACCESS_TOKEN` | `NEXT_PUBLIC_TMDB_ACCESS_TOKEN` |
| `VITE_API_BASE_URL` | `NEXT_PUBLIC_API_BASE_URL` |

`pnpm dev`는 기존 Spring Boot CORS 설정에 맞춰 `http://localhost:5173`에서 실행합니다. `frontend/`에서 `pnpm build`로 프로덕션 번들을 만들고, `pnpm lint`로 ESLint를 실행합니다. `NEXT_PUBLIC_*` 값은 클라이언트 번들에 포함되므로 배포 환경에서는 빌드 전에 설정합니다.

| 경로 | App Router |
| --- | --- |
| `/`, `/search` | `frontend/src/app/page.tsx`, `frontend/src/app/search/page.tsx` |
| `/movies/:movieId` | `frontend/src/app/movies/[movieId]/page.tsx` |
| `/login`, `/signup` | `frontend/src/app/login/page.tsx`, `frontend/src/app/signup/page.tsx` |
| `/mypage`, `/mypage/edit` | `frontend/src/app/(authenticated)/mypage/` |
| `/fetch-example.html` | `frontend/src/app/fetch-example.html/page.tsx` |

- `frontend/src/app/layout.tsx`는 공통 Header, Footer와 `children`을 렌더링합니다. 기존 화면 컴포넌트는 `frontend/src/features/`에서 React Query, Zustand, 폼 이벤트를 처리합니다.
- `Link`의 `to`와 `params`는 `href`로, `useNavigate`는 `useRouter().push()`로 바꿨습니다. 검색어와 페이지 번호는 `useSearchParams()`로 읽고, 영화 상세는 서버 페이지에서 `params`를 받아 영화 ID를 전달합니다.
- Cache Components가 켜진 상태에서 URL을 읽는 목록, 검색, 상세 및 헤더의 활성 메뉴를 `Suspense`로 감쌌습니다. `Providers`는 기존 React Query의 30초 캐시 설정을 유지하고 첫 렌더 뒤에 Zustand 저장 상태를 복원합니다. 프로필 편집 폼은 저장된 값이 복원된 뒤 초기화됩니다.
- 회원가입, 중복 확인, JWT 인증, 내 정보, 즐겨찾기, 평점은 기존 Spring Boot API를 사용합니다. 개발 서버의 `/api/` 요청은 설정된 백엔드 주소로 전달됩니다.

### 브라우저 검증 항목

- TMDB 환경 변수를 설정한 뒤 영화 목록, 검색, 페이지 이동, 상세 링크를 확인합니다. 검색 및 목록에서 새로고침과 뒤로가기를 했을 때 URL의 검색어와 페이지가 유지되는지 확인합니다.
- 즐겨찾기를 추가하고 내 정보 화면에서 확인합니다. 저장 모드를 전환한 뒤 새로고침과 새 탭에서 각각 저장 범위를 확인합니다.
- Spring Boot를 실행한 뒤 회원가입, 이메일·닉네임 중복 확인을 확인합니다. 로그인 후 프로필 수정 화면에서 저장한 닉네임과 이미지가 새로고침 뒤 복원되는지 확인합니다.

### 변경 후 화면 갱신

| 방식 | 적용한 기능 | 추가 요청과 화면 반영 |
| --- | --- | --- |
| `setQueryData` | 즐겨찾기 추가·해제 | 서버가 변경을 확인하면 영화별 상태와 이미 받아 둔 목록을 즉시 갱신합니다. 목록 캐시가 없으면 기존 조회 흐름에서 서버 목록을 불러옵니다. |
| `invalidateQueries` | 평점 등록·수정·삭제 | 현재 영화의 평점 캐시를 무효화하고, 화면에서 구독 중이면 회원 평점 API를 다시 호출합니다. 서버가 반환한 별점과 후기, 등록 상태로 화면을 갱신합니다. |

변경 결과만으로 기존 캐시를 정확하게 갱신할 수 있으면 `setQueryData`가 추가 요청을 줄입니다. 서버 계산이나 페이지네이션까지 반영해야 하면 `invalidateQueries`로 최신 데이터를 다시 가져오는 편이 안전합니다.
