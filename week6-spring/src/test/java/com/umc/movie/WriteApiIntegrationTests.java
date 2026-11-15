package com.umc.movie;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WriteApiIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired MemberRepository members;
    @Autowired RatingRepository ratings;
    @Autowired PasswordEncoder encoder;
    Member owner;
    Member other;

    @BeforeEach
    void setUp() {
        owner = members.saveAndFlush(new Member("owner6@test.com", "dummy", "owner6"));
        other = members.saveAndFlush(new Member("other6@test.com", "dummy", "other6"));
    }

    private String signup(String email, String password, String nickname) throws Exception {
        return json.writeValueAsString(Map.of("email", email, "password", password, "nickname", nickname));
    }

    private Rating rating() {
        return ratings.saveAndFlush(Rating.builder().member(owner).movieId(550L).score(5).comment("원본").build());
    }

    @Test void signupHashesPasswordAndDoesNotExposeIt() throws Exception {
        String body = mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new6@test.com", "Umc!1234", "new6")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.password").doesNotExist())
                .andExpect(jsonPath("$.result.length()").value(3))
                .andReturn().getResponse().getContentAsString();
        Member saved = members.findById(json.readTree(body).path("result").path("memberId").asLong()).orElseThrow();
        assertThat(saved.getPassword()).hasSize(60).isNotEqualTo("Umc!1234");
        assertThat(encoder.matches("Umc!1234", saved.getPassword())).isTrue();
    }

    @Test void duplicateEmailHasSpecificCode() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup(owner.getEmail(), "Umc!1234", "new6")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4091"))
                .andExpect(jsonPath("$.isSuccess").value(false)).andExpect(jsonPath("$.result").isEmpty());
    }

    @Test void duplicateNicknameHasSpecificCode() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new6@test.com", "Umc!1234", owner.getNickname())))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4092"));
    }

    @Test void invalidEmail() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("invalid", "Umc!1234", "new6")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"short", "abcdefgh", "ABCDEFGH", "12345678", "Umc12345", "umc!1234", "UMC!1234"})
    void invalidPasswords(String password) throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new6@test.com", password, "new6")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
    }

    @ParameterizedTest
    @ValueSource(strings = {"a", "1234567890123", "  "})
    void invalidNicknames(String nickname) throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new6@test.com", "Umc!1234", nickname)))
                .andExpect(status().isBadRequest());
    }

    @Test void rejectsMoreThan72PasswordBytes() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new6@test.com", "Umc!1234" + "가".repeat(22), "new6")))
                .andExpect(status().isBadRequest());
    }

    @Test void ratingLifecycleAndDuplicateProtection() throws Exception {
        String body = mvc.perform(post("/members/{id}/ratings", owner.getMemberId())
                .contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":5,\"comment\":\"처음\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("COMMON201"))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(body).path("result").asLong();
        mvc.perform(post("/members/{id}/ratings", owner.getMemberId())
                .contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING4091"));
        assertThat(ratings.findByMember_MemberIdOrderByRatingIdDesc(owner.getMemberId())).hasSize(1);
        mvc.perform(patch("/members/{member}/ratings/{rating}", owner.getMemberId(), id)
                .contentType(MediaType.APPLICATION_JSON).content("{\"score\":3,\"comment\":\"수정\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"));
        mvc.perform(get("/members/{id}/ratings", owner.getMemberId()))
                .andExpect(jsonPath("$[0].score").value(3)).andExpect(jsonPath("$[0].comment").value("수정"));
        mvc.perform(delete("/members/{member}/ratings/{rating}", owner.getMemberId(), id))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
        mvc.perform(get("/members/{id}/ratings", owner.getMemberId())).andExpect(content().json("[]"));
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 6})
    void invalidScores(int score) throws Exception {
        mvc.perform(post("/members/{id}/ratings", owner.getMemberId()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":" + score + "}"))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"movieId\":550,\"score\":3.5}", "{\"movieId\":0,\"score\":3}", "{\"movieId\":1.5,\"score\":3}", "{\"movieId\":550}", "{bad"})
    void invalidRatingBodies(String body) throws Exception {
        mvc.perform(post("/members/{id}/ratings", owner.getMemberId()).contentType(MediaType.APPLICATION_JSON)
                .content(body)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
    }

    @Test void longCommentIsRejectedOnCreateAndUpdate() throws Exception {
        String body = json.writeValueAsString(Map.of("movieId",550,"score",4,"comment","가".repeat(501)));
        mvc.perform(post("/members/{id}/ratings", owner.getMemberId()).contentType(MediaType.APPLICATION_JSON)
                .content(body)).andExpect(status().isBadRequest());
        mvc.perform(patch("/members/{member}/ratings/{rating}", owner.getMemberId(), rating().getRatingId())
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
    }

    @Test void otherMemberCannotUpdateOrDelete() throws Exception {
        Long id = rating().getRatingId();
        mvc.perform(patch("/members/{member}/ratings/{rating}", other.getMemberId(), id)
                .contentType(MediaType.APPLICATION_JSON).content("{\"score\":1}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMON403"));
        mvc.perform(delete("/members/{member}/ratings/{rating}", other.getMemberId(), id))
                .andExpect(status().isForbidden());
        assertThat(ratings.findById(id).orElseThrow().getScore()).isEqualTo(5);
    }

    @Test void missingRatingReturns404OnUpdateAndDelete() throws Exception {
        mvc.perform(patch("/members/{member}/ratings/9223372036854775807", owner.getMemberId())
                .contentType(MediaType.APPLICATION_JSON).content("{\"score\":1}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("COMMON404"));
        mvc.perform(delete("/members/{member}/ratings/9223372036854775807", owner.getMemberId()))
                .andExpect(status().isNotFound());
    }

    @Test void cannotCreateForMissingMember() throws Exception {
        mvc.perform(post("/members/9223372036854775807/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("COMMON404"));
    }

    @Test void preflightAllowsJsonPost() throws Exception {
        mvc.perform(options("/members").header("Origin","http://localhost:5175")
                .header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","content-type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5175"));
    }
}
