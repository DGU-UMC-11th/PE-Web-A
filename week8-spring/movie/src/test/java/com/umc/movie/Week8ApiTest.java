package com.umc.movie;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Favorite;
import com.umc.movie.repository.*;
import com.umc.movie.util.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Week8ApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired MemberRepository members;
    @Autowired RatingRepository ratings;
    @MockitoSpyBean FavoriteRepository favorites;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtil jwt;
    Member a;
    Member b;
    String tokenA;
    String tokenB;

    /** 테스트마다 독립적인 두 회원을 만들며 테스트 자체에는 트랜잭션을 걸지 않는다. */
    @BeforeEach
    void prepare() {
        favorites.deleteAll();
        ratings.deleteAll();
        members.deleteAll();
        String password = encoder.encode("Umc!1234");
        a = members.saveAndFlush(new Member("a@umc.com", password, "회원에이"));
        b = members.saveAndFlush(new Member("b@umc.com", password, "회원비"));
        tokenA = jwt.createAccessToken(a.getMemberId(), a.getEmail());
        tokenB = jwt.createAccessToken(b.getMemberId(), b.getEmail());
    }

    /** JSON 바디와 인증 헤더를 포함한 요청을 실행한다. */
    private ResultActions call(MockHttpServletRequestBuilder request, String token, Object body) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body));
        return mvc.perform(request);
    }

    /** 성공 응답의 result를 읽는다. */
    private JsonNode result(ResultActions response) throws Exception {
        return mapper.readTree(response.andReturn().getResponse().getContentAsString()).get("result");
    }

    /** 영화 기록 요청 바디를 만든다. */
    private Map<String, Object> record(long movieId, boolean favorite) {
        return Map.of("movieId", movieId, "score", 5, "comment", "다시 보고 싶은 영화", "addToFavorites", favorite);
    }

    /** 회원가입의 bcrypt 저장과 비밀번호 미노출, 실제 로그인 발급을 확인한다. */
    @Test void signupAndLogin() throws Exception {
        call(post("/members"), null, Map.of("email", "new@umc.com", "nickname", "새회원", "password", "Umc!1234"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.result.password").doesNotExist());
        Member saved = members.findByEmail("new@umc.com").orElseThrow();
        assertThat(encoder.matches("Umc!1234", saved.getPassword())).isTrue();
        String token = result(call(post("/auth/login"), null, Map.of("email", "new@umc.com", "password", "Umc!1234"))
                .andExpect(status().isOk())).get("accessToken").asText();
        assertThat(jwt.getMemberId(token)).isEqualTo(saved.getMemberId());
        call(get("/members/me"), token, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.result.nickname").value("새회원"))
                .andExpect(jsonPath("$.result.password").doesNotExist());
    }

    /** 계정 미존재와 틀린 비밀번호가 같은 오류를 반환한다. */
    @Test void loginFailuresDoNotRevealAccountExistence() throws Exception {
        String first = call(post("/auth/login"), null, Map.of("email", "missing@umc.com", "password", "wrong"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_1"))
                .andReturn().getResponse().getContentAsString();
        String second = call(post("/auth/login"), null, Map.of("email", a.getEmail(), "password", "wrong"))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
        assertThat(first).isEqualTo(second);
    }

    /** 인증 없는 즐겨찾기와 영화 기록, 내 정보 접근은 저장 전에 거절한다. */
    @Test void missingTokensAreRejected() throws Exception {
        call(get("/members/me"), null, null).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_2"));
        call(post("/favorites"), null, Map.of("movieId", 550)).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_2"));
        call(get("/favorites"), null, null).andExpect(status().isUnauthorized());
        call(get("/favorites/550"), null, null).andExpect(status().isUnauthorized());
        call(delete("/favorites/550"), null, null).andExpect(status().isUnauthorized());
        call(post("/movie-records"), null, record(550, true)).andExpect(status().isUnauthorized());
        assertThat(favorites.count()).isZero();
        assertThat(ratings.count()).isZero();
    }

    /** 위조·잘못된 subject·만료 시각 누락·만료된 토큰을 구분한다. */
    @Test void validatesJwtSignatureClaimsAndExpiry() throws Exception {
        var key = Keys.hmacShaKeyFor("test-only-week8-signing-key-not-for-real-use".getBytes(StandardCharsets.UTF_8));
        var otherKey = Keys.hmacShaKeyFor("another-test-only-week8-key-with-at-least-32-bytes".getBytes(StandardCharsets.UTF_8));
        String forged = Jwts.builder().subject(a.getMemberId().toString()).expiration(Date.from(Instant.now().plusSeconds(100))).signWith(otherKey).compact();
        String noExpiry = Jwts.builder().subject(a.getMemberId().toString()).signWith(key).compact();
        String noSubject = Jwts.builder().expiration(Date.from(Instant.now().plusSeconds(100))).signWith(key).compact();
        for (String token : new String[]{"invalid", forged, noExpiry, noSubject}) {
            call(get("/favorites"), token, null).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_3"));
        }
        String expired = Jwts.builder().subject(a.getMemberId().toString()).expiration(Date.from(Instant.now().minusSeconds(120))).signWith(key).compact();
        call(get("/favorites"), expired, null).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_4"));
    }

    /** 토큰의 회원만 수정되며 중복 닉네임과 잘못된 입력은 저장되지 않는다. */
    @Test void updateOwnProfile() throws Exception {
        call(patch("/members/me"), tokenA, Map.of("nickname", "수정이름")).andExpect(status().isOk())
                .andExpect(jsonPath("$.result.nickname").value("수정이름"));
        assertThat(members.findById(b.getMemberId()).orElseThrow().getNickname()).isEqualTo("회원비");
        call(patch("/members/me"), tokenA, Map.of("nickname", "회원비")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("MEMBER409_1"));
        call(patch("/members/me"), tokenA, Map.of("nickname", " ")).andExpect(status().isBadRequest());
    }

    /** 즐겨찾기 등록·최신순 목록·여부·중복·해제 흐름을 검증한다. */
    @Test void favoriteLifecycle() throws Exception {
        call(get("/favorites"), tokenA, null).andExpect(status().isOk()).andExpect(jsonPath("$.result").isEmpty());
        call(get("/favorites/550"), tokenA, null).andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(false));
        call(post("/favorites"), tokenA, Map.of("movieId", 550)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.favoriteId").isNumber()).andExpect(jsonPath("$.result.createdAt").isNotEmpty());
        call(post("/favorites"), tokenA, Map.of("movieId", 238)).andExpect(status().isCreated());
        call(get("/favorites"), tokenA, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.result[0].movieId").value(238)).andExpect(jsonPath("$.result[1].movieId").value(550));
        call(get("/favorites/550"), tokenA, null).andExpect(jsonPath("$.result.isFavorite").value(true));
        call(post("/favorites"), tokenA, Map.of("movieId", 550)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        assertThat(favorites.count()).isEqualTo(2);
        call(delete("/favorites/550"), tokenA, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200")).andExpect(jsonPath("$.result").value(nullValue()));
        call(get("/favorites/550"), tokenA, null).andExpect(jsonPath("$.result.isFavorite").value(false));
        call(delete("/favorites/550"), tokenA, null).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("FAVORITE404_1"));
    }

    /** 같은 영화라도 회원별로 독립적으로 저장·조회·삭제한다. 요청의 가짜 회원 ID는 소유권을 바꾸지 않는다. */
    @Test void favoritesAreIsolatedByToken() throws Exception {
        call(post("/favorites").queryParam("memberId", b.getMemberId().toString()), tokenA,
                Map.of("movieId", 550, "memberId", b.getMemberId())).andExpect(status().isCreated());
        assertThat(favorites.findAll().getFirst().getMember().getMemberId()).isEqualTo(a.getMemberId());
        call(get("/favorites"), tokenB, null).andExpect(jsonPath("$.result").isEmpty());
        call(get("/favorites/550"), tokenB, null).andExpect(jsonPath("$.result.isFavorite").value(false));
        call(delete("/favorites/550"), tokenB, null).andExpect(status().isNotFound());
        call(post("/favorites"), tokenB, Map.of("movieId", 550)).andExpect(status().isCreated());
        call(delete("/favorites/550"), tokenB, null).andExpect(status().isOk());
        assertThat(favorites.existsByMember_MemberIdAndMovieId(a.getMemberId(), 550L)).isTrue();
    }

    /** 즐겨찾기 입력 오류를 컨트롤러에서 차단한다. */
    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"movieId\":0}", "{\"movieId\":-1}", "{\"movieId\":1.5}", "{\"movieId\":\"invalid\"}"})
    void favoriteValidation(String body) throws Exception {
        mvc.perform(post("/favorites").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(favorites.count()).isZero();
    }

    /** 평점 쓰기는 토큰을 사용하며 본인 수정·삭제와 403·404를 구분한다. */
    @Test void ratingsUseTokenAndEnforceOwnership() throws Exception {
        long id = result(call(post("/ratings"), tokenA, Map.of("movieId", 550, "score", 5)).andExpect(status().isCreated())).get("ratingId").asLong();
        call(post("/ratings"), tokenA, Map.of("movieId", 550, "score", 3)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING409_1"));
        call(patch("/ratings/" + id), tokenB, Map.of("score", 1)).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("RATING403_1"));
        call(delete("/ratings/" + id), tokenB, null).andExpect(status().isForbidden());
        call(patch("/ratings/" + id), tokenA, Map.of("score", 4, "comment", "수정")).andExpect(status().isOk()).andExpect(jsonPath("$.result.comment").value("수정"));
        call(get("/members/" + a.getMemberId() + "/ratings"), null, null).andExpect(status().isOk()).andExpect(jsonPath("$.result[0].score").value(4));
        call(delete("/ratings/" + id), tokenA, null).andExpect(status().isOk()).andExpect(jsonPath("$.result").value(nullValue()));
        call(delete("/ratings/" + id), tokenA, null).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RATING404_1"));
    }

    /** 영화 기록 성공 시 두 테이블에 모두 저장하고 중복 평점은 새 행을 남기지 않는다. */
    @Test void movieRecordStoresBothAndRejectsDuplicateRating() throws Exception {
        call(post("/movie-records"), tokenA, record(238, true)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.rating.movieId").value(238)).andExpect(jsonPath("$.result.favorite.movieId").value(238));
        call(post("/movie-records"), tokenA, record(238, true)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING409_1"));
        assertThat(ratings.count()).isEqualTo(1);
        assertThat(favorites.count()).isEqualTo(1);
    }

    /** 즐겨찾기를 선택하지 않으면 기존 북마크가 있어도 평점만 저장한다. */
    @Test void movieRecordCanSaveOnlyRating() throws Exception {
        favorites.saveAndFlush(new Favorite(a, 238L));
        call(post("/movie-records"), tokenA, record(238, false)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.rating.score").value(5)).andExpect(jsonPath("$.result.favorite").value(nullValue()));
        assertThat(ratings.count()).isEqualTo(1);
        assertThat(favorites.count()).isEqualTo(1);
    }

    /** 후속 즐겨찾기의 서비스 검사가 실패하면 이미 flush한 평점도 롤백된다. */
    @Test void laterFavoriteConflictRollsBackRating() throws Exception {
        favorites.saveAndFlush(new Favorite(a, 238L));
        call(post("/movie-records"), tokenA, record(238, true)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        assertThat(ratings.count()).isZero();
        assertThat(favorites.count()).isEqualTo(1);
    }

    /** 사전 검사를 통과한 상황에서도 실제 DB UNIQUE 위반이 평점까지 롤백하고 전용 코드를 반환한다. */
    @Test void databaseUniqueFailureAlsoRollsBackRating() throws Exception {
        favorites.saveAndFlush(new Favorite(a, 238L));
        doReturn(false).when(favorites).existsByMember_MemberIdAndMovieId(a.getMemberId(), 238L);
        call(post("/movie-records"), tokenA, record(238, true)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        assertThat(ratings.count()).isZero();
        assertThat(favorites.count()).isEqualTo(1);
    }

    /** 두 동시 요청이 와도 동일한 회원·영화 관계는 한 번만 저장된다. */
    @Test void concurrentFavoritesHaveOneWinner() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            CountDownLatch start = new CountDownLatch(1);
            Callable<Integer> action = () -> { start.await(); return call(post("/favorites"), tokenA, Map.of("movieId", 550))
                    .andReturn().getResponse().getStatus(); };
            Future<Integer> first = executor.submit(action);
            Future<Integer> second = executor.submit(action);
            start.countDown();
            assertThat(java.util.List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS))).containsExactlyInAnyOrder(201, 409);
            assertThat(favorites.count()).isEqualTo(1);
        }
    }

    /** 영화 기록 DTO의 필수 값·범위·후기 길이 검증으로 저장이 시작되지 않는다. */
    @Test void invalidMovieRecordsDoNotSave() throws Exception {
        for (Map<String, ?> body : java.util.List.of(Map.of("movieId", 0, "score", 5, "addToFavorites", true),
                Map.of("movieId", 550, "score", 6, "addToFavorites", true),
                Map.of("movieId", 550, "score", 5),
                Map.of("movieId", 550, "score", 5, "comment", "a".repeat(501), "addToFavorites", true))) {
            call(post("/movie-records"), tokenA, body).andExpect(status().isBadRequest());
        }
        assertThat(ratings.count()).isZero();
        assertThat(favorites.count()).isZero();
    }

    /** 브라우저 preflight 요청에는 토큰을 요구하지 않는다. */
    @ParameterizedTest
    @ValueSource(strings = {"GET", "POST", "PATCH", "DELETE"})
    void corsPreflight(String method) throws Exception {
        mvc.perform(options("/favorites").header("Origin", "http://localhost:5173").header("Access-Control-Request-Method", method)
                .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
