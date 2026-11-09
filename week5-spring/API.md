# API 명세

Base URL: `http://localhost:8080`. 이번 주차는 로그인 없이 조회한다. GET 요청에는 body가 없다.

| 기능 | Method / Path | 입력 | 성공 응답 |
|---|---|---|---|
| 닉네임 중복 확인 | GET /members/nickname/{nickname} | Path 문자열 | 200, `{ "available": false }` |
| 이메일 중복 확인 | GET /members/email/{email} | Path 문자열 | 200, `{ "available": false }` |
| 회원 평점 조회 | GET /members/{memberId}/ratings | Path 정수 | 200, 평점 DTO 배열 |

`available: true`는 사용 가능, `false`는 이미 존재함을 뜻한다.
프론트에서는 경로 값을 `encodeURIComponent`로 인코딩한다. 한글 값에 따옴표를 붙이지 않는다.

평점은 `ratingId DESC` (최신 등록순)으로 반환한다.

```json
[
  {
    "ratingId": 2,
    "movieId": 155,
    "score": 4,
    "comment": "다시 봐도 명작",
    "createdAt": "2026-11-01T12:00:00",
    "updatedAt": "2026-11-01T12:00:00"
  }
]
```

위 날짜는 예시다. 실제 시드 삽입 시간이 반환된다. `comment`는 null일 수 있다.
회원 비밀번호 등 엔티티 내부 정보는 응답에 포함하지 않는다.

- 없는 회원: 404 (ResponseStatusException 사용)
- 존재하지만 평점 없는 회원: 200, `[]`
- 숫자로 변환 불가능한 회원 번호: 400
- 닉네임 길이 2~12 및 이메일 형식의 서버 검증, 페이지네이션은 선택 미션이므로 미구현

## Postman 검증 사례

1. GET `/members/nickname/수현` → available false
2. GET `/members/nickname/새닉네임` → available true
3. GET `/members/email/noco@umc.com` → available false
4. GET `/members/email/new@umc.com` → available true
5. GET `/members/1/ratings` → 2건, ratingId 2 → 1
6. GET `/members/2/ratings` → 1건, ratingId 3
7. GET `/members/999/ratings` → 404
