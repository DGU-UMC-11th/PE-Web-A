# ORM 도서 API 미션 제출 안내

## 구현 범위

- Book, Category 엔티티와 Book → Category 다대일 관계
- GET /books: 모든 도서를 bookId 내림차순으로 조회
- BookResponse: bookId, title, description, categoryName, isAvailable
- POST /books: 요청 DTO 검증, 카테고리 확인, 엔티티 저장, 201과 응답 DTO 반환
- categoryId 누락, 공백 제목, 100자 초과 제목: 400
- 없는 categoryId: 400과 `존재하지 않는 카테고리입니다.` 오류
- 선택 미션 2: GET /books?keyword=스프링 — 제목 부분 검색, bookId 내림차순
- 검색어 생략 또는 공백: 전체 조회, 검색 결과 없음: 200과 []

## 핵심 코드 캡처

src/main/java/com/umc/study 아래 파일을 캡처합니다.

- entity/Book.java, entity/Category.java
- dto/CreateBookRequest.java, dto/BookResponse.java
- repository/BookRepository.java, repository/CategoryRepository.java
- service/BookService.java
- controller/BookController.java

## Postman 확인과 캡처

서버 재실행 후 http://localhost:8080을 사용합니다. POST는 Body → raw → JSON을 선택합니다.

1. GET /books: 200, 도서 ID 내림차순, 5개 응답 필드, 대여 불가 도서 포함 여부 확인.
2. POST /books: 아래 요청의 categoryId를 실제 존재하는 ID로 설정. 201과 새 bookId 확인.

```json
{"categoryId": 1, "title": "스프링 입문", "description": "ORM 실습 도서"}
```

3. POST /books: DB에 없는 categoryId로 요청. 400과 카테고리 오류 메시지 확인.
4. POST /books: title을 공백으로 변경. 400 확인. categoryId 누락 및 101자 제목도 400인지 확인.
5. GET /books?keyword=스프링: 200, 제목에 스프링이 포함된 도서만 반환되는지 확인.
6. GET /books?keyword=존재하지않는검색어_미션확인: 일치하는 제목이 없다면 200과 [] 확인.

각 캡처에는 요청 URL, POST 요청 JSON, 상태 코드와 응답 본문이 보이게 합니다. 검색 결과가 없는 경우는 오류가 아닌 정상적인 빈 결과입니다. 정상 요청과 예외 요청은 각각 POST 성공 및 POST 검증 실패로 확인하고, 검색은 일치 결과와 빈 결과를 각각 확인합니다.

## Raw SQL 방식과 비교 (제출용)

3주차에는 JdbcTemplate에서 SELECT와 INSERT SQL을 직접 작성했지만, 이번에는 JpaRepository의 조회 메서드와 save()로 도서를 조회하고 저장한다.
DB 행을 Map으로 다루던 방식에서 Book과 Category 엔티티 및 다대일 관계로 데이터를 표현하는 방식으로 변경했다.
요청과 응답을 DTO로 분리해 DB 컬럼명 대신 명시적인 API 필드를 사용하며, 요청 검증과 카테고리 존재 여부 확인을 저장 전에 수행한다.
서비스에 트랜잭션을 적용해 조회와 DTO 변환, 등록 작업의 범위를 명확하게 했다.
선택 미션에서는 SQL 문자열을 추가하지 않고 Repository의 제목 부분 검색 메서드로 검색 기능을 구현했다.

## 실행 검증 문장

아래 문장은 위 Postman 확인을 실제로 완료한 후 사용합니다.

“전체 조회의 최신순 정렬과 DTO 응답, 정상 등록의 201 응답, 잘못된 요청 및 없는 카테고리의 400 응답, 제목 부분 검색 결과가 요구사항과 일치함을 확인했다.”
