# 5주차 · 영화 평점 서비스 (#63)

새로운 Spring Boot 3.5.16 / Java 21 / Gradle 프로젝트다. 3·4주차 도서 API는 변경하지 않는다.
Spring Initializr 다운로드본은 아니며 워크북의 의존성/구조를 직접 구성하고 기존 Gradle Wrapper만 재사용했다.

## 구조

- `movie/`: Spring 프로젝트. IntelliJ에서 이 폴더의 `build.gradle`을 Gradle 프로젝트로 연다.
- `sql/01_schema.sql`: 새 `umc_movie` DB와 member/rating/favorite 테이블
- `sql/02_seed.sql`: 회원 2명, 평점 3건 (초기 테이블에 한 번만 실행)
- `web/`: 직접 작성한 회원·평점 화면. 세 API 모두 브라우저 fetch로 호출한다.
- `API.md`: 요청/응답 명세와 확인 사례
- `ERD.md`: 회원, 평점, 즐겨찾기의 관계

## 1. MySQL 준비

IntelliJ DB 콘솔에서 `sql/01_schema.sql` 전체를 먼저 실행하고 `sql/02_seed.sql`을 실행한다.
기존 도서 DB `umc_week2`를 사용하지 않는다. SQL은 기존 테이블을 삭제하지 않는다.
이미 생성된 테이블이 있으면 재실행 전에 내용을 확인한다. 시드는 ID 1, 2의 새 회원을 전제로 한다.
비밀번호 컬럼의 값은 로그인할 수 없는 더미 문자열이며 실제 비밀번호가 아니다.

## 2. 서버 실행

IntelliJ에서 `movie` 폴더를 열고 Gradle 동기화 후 `MovieApplication`을 실행한다.
Run → Edit Configurations → MovieApplication → Modify options → Environment variables에 설정한다.

```text
DB_PASSWORD=본인의_Homebrew_MySQL_비밀번호
```

기본값은 `DB_URL=jdbc:mysql://127.0.0.1:3306/umc_movie`, `DB_USER=root`다.
다른 DB 접속 정보가 필요하면 이 두 환경변수를 함께 지정한다.
JPA는 `ddl-auto: validate`, `open-in-view: false`다. 테이블은 SQL로 먼저 준비해야 한다.
3·4주차 서버가 8080을 사용 중이면 해당 서버를 먼저 중지한다.

터미널에서 실행하려면 `movie` 폴더에서 비밀번호를 환경변수로 설정한 뒤 실행한다.

```bash
./gradlew bootRun
```

`.env`를 자동 로딩하는 기능은 넣지 않았다. IntelliJ 실행 환경변수로 설정하면 된다.

## 3. 실제 웹 화면 실행

기존 프론트 Vite 개발 서버가 5173을 사용 중이면 먼저 종료한다.
저장소 루트에서 아래를 실행하고 **http://localhost:5173** 에 접속한다.

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory week5-spring/web
```

파일을 더블클릭하여 `file://`로 열지 않는다. `localhost`와 `127.0.0.1`은 서로 다른 origin이므로 브라우저 주소는 위와 동일하게 사용한다.

- 닉네임 `수현` → 이미 사용 중, 새 닉네임 → 사용 가능
- 이메일 `noco@umc.com` → 이미 사용 중, 새 이메일 → 사용 가능
- 회원 1 → 평점 2건 (ratingId 2, 1 순서), 회원 2 → 1건
- 회원 999 → 존재하지 않는 회원 안내 / HTTP 404
- 각 카드의 **요청 · 응답 보기**를 열면 URL, 상태 코드, JSON을 함께 볼 수 있다.

이 화면은 회원·평점 조회를 위한 실제 웹 화면이다. 로그인/회원가입/평점 작성 기능과 TMDB 영화 상세정보 요청은 이번 백엔드 범위에 추가하지 않았다.

## 4. CORS 설정 전후 실습

1. 서버 실행 환경변수에 `CORS_ENABLED=false`를 넣고 재시작한다.
2. 웹 화면에서 버튼을 누른다. 개발자 도구 Console에서 CORS 오류를 확인해 캡처한다.
3. `CORS_ENABLED`를 제거하거나 `true`로 바꾸고 서버를 재시작한다.
4. 같은 페이지에서 세 API 버튼을 각각 눌러 정상 응답을 확인한다.

기본 허용 origin은 `http://localhost:5173` 하나다. 필요하면 `FRONTEND_ORIGIN` 환경변수로 변경한다.
Postman에는 브라우저 CORS 정책이 적용되지 않으므로 반드시 웹에서도 확인한다.

## 5. 제출 확인

- Entity, DTO, Controller/Service 핵심 코드 캡처 또는 코드 참고 링크
- Postman에서 세 GET API의 URL과 응답 JSON이 함께 보이는 캡처
- 직접 만든 웹 화면에서 **세 API 각각** 정상 응답이 보이는 캡처
- CORS 설정 전후 과정 및 실제 발생한 문제의 해결 기록
- ERD와 API 명세를 미션 기록에 함께 첨부하면 설계 과정을 설명하기 좋다.

## 검증

```bash
cd week5-spring/movie
./gradlew test bootJar
```

자동 테스트는 H2 MySQL 모드에서 별도 스키마를 만들고 JPA validate 및 API를 검증한다.
실제 MySQL 연결과 사용자 브라우저의 캡처는 위 순서로 별도 확인해야 한다.
빌드 디렉터리, IDE 설정, 환경변수 파일은 `.gitignore`에서 제외한다.
