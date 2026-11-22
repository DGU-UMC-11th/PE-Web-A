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

## 8주차 로컬 실행

1. 별도 백엔드 프로젝트에서 [PR #109의 8주차 서버](https://github.com/DGU-UMC-11th/PE-Web-A/pull/109)를 포트 8080으로 실행합니다.
2. 프런트엔드의 `.env.local`에 `VITE_API_BASE_URL=http://localhost:8080`을 지정하고 `npm run dev`를 실행합니다. 개발 서버는 인증, 회원, 즐겨찾기, 평점 요청을 백엔드에 전달합니다.

### 변경 후 화면 갱신

| 방식 | 적용한 기능 | 추가 요청과 화면 반영 |
| --- | --- | --- |
| `setQueryData` | 즐겨찾기 추가·해제 | 서버가 변경을 확인하면 영화별 상태와 이미 받아 둔 목록을 즉시 갱신합니다. 목록 캐시가 없으면 기존 조회 흐름에서 서버 목록을 불러옵니다. |
| `invalidateQueries` | 평점 등록·수정·삭제 | 현재 영화의 평점 캐시를 무효화하고, 화면에서 구독 중이면 회원 평점 API를 다시 호출합니다. 서버가 반환한 별점과 후기, 등록 상태로 화면을 갱신합니다. |

변경 결과만으로 기존 캐시를 정확하게 갱신할 수 있으면 `setQueryData`가 추가 요청을 줄입니다. 서버 계산이나 페이지네이션까지 반영해야 하면 `invalidateQueries`로 최신 데이터를 다시 가져오는 편이 안전합니다.
