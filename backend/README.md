# ORM 도서 API 미션

Spring Boot 3.5.0 / Java 21 / Spring Data JPA / MySQL

필수 기능: GET /books, POST /books, DTO 검증, 카테고리 존재 여부 확인.
선택 기능: GET /books?keyword=스프링 제목 부분 검색.

기존 book, category 테이블이 있는 MySQL DB를 사용합니다. 실행 전에 DB_URL, DB_USERNAME, DB_PASSWORD 환경변수를 설정하세요. DB_URL에는 기존 DB의 JDBC URL을 넣습니다. ddl-auto는 validate로 설정하여 기존 스키마를 검증하고 자동 변경하지 않습니다.

Windows 실행: .\gradlew.bat bootRun

제출 확인 방법과 Raw SQL 비교 설명은 ORM-MISSION.md를 참고하세요.
