# 4주차 Spring Boot 필수 미션 — JPA 도서 API

3주차 `week3-spring/study`를 복사해 도서 API에 JPA를 적용했습니다. 원본의 실제 API는 `GET /books/category/{categoryId}`와 `POST /rentals`였으며, 이번 도서 API는 워크북의 `GET /books`, `POST /books`에 맞췄습니다. 복사된 대여 API는 기존 JDBC 방식으로 유지하며 이번 ORM 검증 범위에는 포함하지 않습니다.

## 실행

IntelliJ에서 이 폴더의 `build.gradle`을 Gradle 프로젝트로 열고 JDK 21을 선택합니다. `StudyApplication` 실행 구성에 기존 MySQL 연결 정보를 설정합니다.

- `DB_URL`: `jdbc:mysql://127.0.0.1:3306/umc_week2`
- `DB_USER`: 기존 MySQL 사용자
- `DB_PW`: 해당 사용자의 비밀번호 (파일에 기록하지 않음)

기존 3주차 서버가 8080에서 실행 중이면 먼저 종료합니다. 환경변수가 설정된 터미널에서는 `./gradlew bootRun`으로 실행할 수도 있습니다. IntelliJ 실행 구성의 환경변수는 터미널에 자동 적용되지 않습니다.

`ddl-auto: validate`로 기존 테이블을 검증하며 DB 테이블이나 더미 데이터를 생성·삭제하지 않습니다. `open-in-view: false`로 설정하고 Service 트랜잭션 안에서 DTO로 변환합니다.

## 핵심 코드

- `entity/Book.java`, `entity/Category.java`: PK, 컬럼, 지연 로딩 다대일 관계
- `dto/CreateBookRequest.java`: 필수 양수 categoryId, 공백이 아닌 100자 이하 title, 선택 description
- `dto/BookResponse.java`: bookId, title, description, categoryName, isAvailable
- `repository/BookRepository.java`: ID 내림차순 조회, EntityGraph로 category 함께 조회
- `repository/CategoryRepository.java`: 카테고리 존재 확인
- `service/BookService.java`: 읽기/쓰기 트랜잭션 및 DTO 변환
- `controller/BookController.java`: GET, POST, @Valid, 201 응답
- `exception/BookExceptionHandler.java`: 입력 오류 400, 없는 카테고리 404

위 경로는 `src/main/java/com/umc/study` 기준입니다.

## Postman 확인 / 제출 캡처

### 1. 전체 조회

`GET http://localhost:8080/books`

200 OK. 모든 도서가 bookId 내림차순이어야 합니다. 대여 불가능한 책도 포함하며 응답은 camelCase DTO 필드만 노출합니다.

### 2. 등록

`POST http://localhost:8080/books` → Body → raw → JSON

```json
{
  "categoryId": 1,
  "title": "ORM으로 배우는 도서 API",
  "description": "4주차 등록 테스트"
}
```

201 Created와 생성된 bookId, categoryName, isAvailable=true를 확인합니다. categoryId는 실제 존재하는 값을 사용합니다. 이어서 GET을 보내 새 책이 맨 앞에 있는지 확인합니다. POST를 다시 보내면 새 도서가 또 등록됩니다.

### 3. 빈 제목

같은 POST에 다음 Body를 보냅니다.

```json
{"categoryId": 1, "title": "   "}
```

400 Bad Request와 errors.title 메시지를 확인합니다.

### 4. 없는 카테고리

DB에 없는 카테고리 ID를 사용합니다.

```json
{"categoryId": 999999, "title": "등록 실패 확인"}
```

404 Not Found와 `존재하지 않는 카테고리입니다.` 메시지를 확인합니다. 실패한 책은 등록되지 않아야 합니다.

## 테스트 결과와 남은 확인

`./gradlew test bootJar` 성공. H2의 MySQL 모드에서 기존 category/book 구조와 동일한 테스트 테이블을 생성하고 JPA validate와 MockMvc 통합 테스트를 실행했습니다. 운영 설정은 계속 MySQL/validate입니다.

- 도서 전체 조회·내림차순·DTO 필드
- 등록 201·DB 저장·조회 반영·설명 생략
- 빈 제목·제목 길이 초과·카테고리 누락/음수·잘못된 JSON/타입 400
- 없는 카테고리 404 및 실패 요청의 미저장
- 기존 대여 Service 테스트

실제 로컬 MySQL 연결 및 Postman 캡처는 위 절차로 별도 확인해야 합니다. H2 테스트 통과가 실제 MySQL 검증을 대체하지는 않습니다.

## 미션 기록 — Raw SQL과 비교

3주차에는 JdbcTemplate에 SQL 문자열을 직접 작성하고 결과를 Map으로 반환했습니다. 4주차 도서 API에서는 엔티티에 테이블과 관계를 매핑하고 JpaRepository가 기본 조회·저장 SQL을 생성하도록 변경했습니다. 요청 DTO와 @Valid를 사용해 입력을 검증하고 응답 DTO로 외부에 공개할 필드를 분리했습니다. 카테고리 이름을 함께 조회할 때는 EntityGraph를 적용하여 관계별 추가 조회를 줄였습니다.

실제 Postman 확인 후 검증 문장: “GET에서 모든 도서를 최신 등록순으로 조회하고 POST에서 정상 요청은 201로 저장되며, 잘못된 요청과 없는 카테고리는 오류로 처리되는 것을 확인했다.”

## 참고

- [Spring MVC 요청 검증](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [Spring Data JPA 쿼리 및 EntityGraph](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
