package com.umc.movie;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiIntegrationTests {
    private static final String SECRET = UUID.randomUUID().toString() + UUID.randomUUID();
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    @DynamicPropertySource
    static void jwtProperties(DynamicPropertyRegistry registry) {
        registry.add("jwt.secret", () -> SECRET);
        registry.add("jwt.access-expiration", () -> 3600);
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtil jwt;
    Member a;
    Member b;
    String tokenA;
    String tokenB;

    @BeforeEach void setUp() {
        a = members.saveAndFlush(new Member("a7@test.com", encoder.encode("Umc!1234"), "회원A7"));
        b = members.saveAndFlush(new Member("b7@test.com", encoder.encode("Umc!1234"), "회원B7"));
        tokenA = jwt.createAccessToken(a.getMemberId(), a.getEmail());
        tokenB = jwt.createAccessToken(b.getMemberId(), b.getEmail());
    }

    private String login(String email, String password) throws Exception {
        return json.writeValueAsString(Map.of("email", email, "password", password));
    }
    private long createRating() throws Exception {
        String body = mvc.perform(post("/ratings").header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":5,\"comment\":\"좋아요\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).path("result").path("ratingId").asLong();
    }
    private String signedToken(String subject, Instant expiration) {
        return Jwts.builder().subject(subject).expiration(Date.from(expiration)).signWith(KEY, Jwts.SIG.HS256).compact();
    }

    @Test void loginAndClaims() throws Exception {
        String body = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(login(a.getEmail(), "Umc!1234")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.nickname").value(a.getNickname()))
                .andExpect(jsonPath("$.result.password").doesNotExist()).andExpect(jsonPath("$.code").value("COMMON200"))
                .andReturn().getResponse().getContentAsString();
        String token = json.readTree(body).path("result").path("accessToken").asText();
        assertThat(jwt.getMemberId(token)).isEqualTo(a.getMemberId());
        var claims = Jwts.parser().verifyWith(KEY).build().parseSignedClaims(token).getPayload();
        assertThat(claims.get("email", String.class)).isEqualTo(a.getEmail());
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime()).isEqualTo(3600000);
    }

    @Test void loginFailuresAreIdentical() throws Exception {
        String missing = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(login("missing7@test.com", "Umc!1234"))).andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String wrong = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(login(a.getEmail(), "wrong"))).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_1")).andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(missing)).isEqualTo(json.readTree(wrong));
    }

    @Test void oldPasswordPolicyDoesNotPreventLogin() throws Exception {
        members.saveAndFlush(new Member("legacy7@test.com", encoder.encode("oldpass"), "예전회원"));
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(login("legacy7@test.com", "oldpass"))).andExpect(status().isOk());
    }

    @Test void tooLongLoginPasswordReturns401() throws Exception {
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(login(a.getEmail(), "a".repeat(73)))).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_1"));
    }

    @Test void missingToken() throws Exception {
        mvc.perform(get("/members/me")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @ParameterizedTest @ValueSource(strings = {"Basic abc", "Token abc", "bearer abc"})
    void wrongHeaderScheme(String header) throws Exception {
        mvc.perform(get("/members/me").header("Authorization", header)).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @ParameterizedTest @ValueSource(strings = {"abc", "", "a.b.c"})
    void invalidToken(String token) throws Exception {
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_3"));
    }

    @Test void tamperedPayloadIsRejected() throws Exception {
        String[] parts = tokenA.split("\\.");
        var payload = json.readTree(Base64.getUrlDecoder().decode(parts[1]));
        ((com.fasterxml.jackson.databind.node.ObjectNode)payload).put("sub", b.getMemberId().toString());
        parts[1] = Base64.getUrlEncoder().withoutPadding().encodeToString(json.writeValueAsBytes(payload));
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + String.join(".", parts)))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_3"));
    }

    @Test void expiredTokenHasDedicatedCode() throws Exception {
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + signedToken(a.getMemberId().toString(), Instant.now().minusSeconds(5))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_4"));
    }

    @ParameterizedTest @ValueSource(strings = {"-1", "0", "abc", "9223372036854775808"})
    void invalidSubject(String subject) throws Exception {
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + signedToken(subject, Instant.now().plusSeconds(60))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_3"));
    }

    @Test void noExpirationIsRejected() throws Exception {
        String token = Jwts.builder().subject(a.getMemberId().toString()).signWith(KEY, Jwts.SIG.HS256).compact();
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_3"));
    }

    @Test void memberInfoDoesNotExposePassword() throws Exception {
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.email").value(a.getEmail()))
                .andExpect(jsonPath("$.result.length()").value(3)).andExpect(jsonPath("$.result.password").doesNotExist());
    }

    @Test void missingMemberHas404() throws Exception {
        String token = jwt.createAccessToken(Long.MAX_VALUE, "deleted7@test.com");
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEMBER404_1"));
    }

    @Test void nicknameUpdateAndUnchangedNickname() throws Exception {
        for (String nickname : new String[]{a.getNickname(), "수정회원7"}) {
            mvc.perform(patch("/members/me").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("nickname", nickname))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.result.nickname").value(nickname));
        }
        mvc.perform(get("/members/me").header("Authorization", "Bearer " + tokenA)).andExpect(jsonPath("$.result.nickname").value("수정회원7"));
    }

    @Test void duplicateNickname() throws Exception {
        mvc.perform(patch("/members/me").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("nickname", b.getNickname()))))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER409_1"));
    }

    @ParameterizedTest @ValueSource(strings = {"", "a", "1234567890123"})
    void invalidNickname(String nickname) throws Exception {
        mvc.perform(patch("/members/me").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("nickname", nickname)))).andExpect(status().isBadRequest());
    }

    @Test void ratingLifecycleAndOwnership() throws Exception {
        long id = createRating();
        mvc.perform(post("/ratings").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":5}")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("RATING409_1"));
        mvc.perform(patch("/ratings/{id}", id).header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                .content("{\"score\":4,\"comment\":\"수정\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.result.score").value(4));
        mvc.perform(patch("/ratings/{id}", id).header("Authorization", "Bearer " + tokenB).contentType(MediaType.APPLICATION_JSON)
                .content("{\"score\":1}")).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("RATING403_1"));
        mvc.perform(delete("/ratings/{id}", id).header("Authorization", "Bearer " + tokenB)).andExpect(status().isForbidden());
        mvc.perform(get("/members/{id}/ratings", a.getMemberId())).andExpect(status().isOk()).andExpect(jsonPath("$[0].score").value(4));
        mvc.perform(delete("/ratings/{id}", id).header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200")).andExpect(jsonPath("$.result").isEmpty());
        mvc.perform(get("/members/{id}/ratings", a.getMemberId())).andExpect(content().json("[]"));
    }

    @Test void bodyMemberIdCannotImpersonateOtherUser() throws Exception {
        mvc.perform(post("/ratings").header("Authorization", "Bearer " + tokenA).contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":155,\"score\":3,\"memberId\":" + b.getMemberId() + "}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/members/{id}/ratings", a.getMemberId())).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/members/{id}/ratings", b.getMemberId())).andExpect(content().json("[]"));
    }

    @Test void oldWriteUrlIsRemoved() throws Exception {
        mvc.perform(post("/members/{id}/ratings", b.getMemberId()).header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":3}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test void missingRatingReturns404() throws Exception {
        mvc.perform(patch("/ratings/9223372036854775807").header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON).content("{\"score\":4}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RATING404_1"));
        mvc.perform(delete("/ratings/9223372036854775807").header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RATING404_1"));
    }

    @Test void protectedWritesRequireToken() throws Exception {
        mvc.perform(post("/ratings").contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":3}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(patch("/members/me").contentType(MediaType.APPLICATION_JSON).content("{\"nickname\":\"새회원\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void invalidScoreAndMalformedBody() throws Exception {
        for (String body : new String[]{"{\"movieId\":550,\"score\":6}", "{\"movieId\":550,\"score\":3.5}", "{"}) {
            mvc.perform(post("/ratings").header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.isSuccess").value(false));
        }
    }

    @Test void registrationAndPublicChecksStillWork() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new7@test.com\",\"password\":\"Umc!1234\",\"nickname\":\"새회원7\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.result.password").doesNotExist());
        mvc.perform(get("/members/nickname/{nickname}", a.getNickname())).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
        mvc.perform(get("/members/email/{email}", a.getEmail())).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
    }

    @Test void jsonAuthorizationPreflightNeedsNoToken() throws Exception {
        mvc.perform(options("/ratings").header("Origin", "http://localhost:5176")
                .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5176"));
    }
}
