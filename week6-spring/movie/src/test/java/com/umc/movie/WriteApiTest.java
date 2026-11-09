package com.umc.movie;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql("/seed-test.sql")
class WriteApiTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired PasswordEncoder encoder;

    private String signup(String email, String password, String nickname) throws Exception {
        return mapper.writeValueAsString(Map.of("email", email, "password", password, "nickname", nickname));
    }

    @Test void signupStoresBcryptAndNeverReturnsPassword() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new@umc.com", "Umc!1234", "새회원")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.memberId").isNumber())
                .andExpect(jsonPath("$.result.email").value("new@umc.com"))
                .andExpect(jsonPath("$.result.nickname").value("새회원"))
                .andExpect(jsonPath("$.result.password").doesNotExist());
        String hash = jdbc.queryForObject("SELECT password FROM member WHERE email = ?", String.class, "new@umc.com");
        assertThat(hash).hasSize(60).isNotEqualTo("Umc!1234");
        assertThat(encoder.matches("Umc!1234", hash)).isTrue();
    }

    @Test void duplicatesUseConflictEnvelopeAndDoNotSave() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("noco@umc.com", "Umc!1234", "새회원")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4091"))
                .andExpect(jsonPath("$.isSuccess").value(false)).andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.nullValue()));
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content(signup("new@umc.com", "Umc!1234", "수현")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4092"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    @Test void invalidSignupFieldsAndBcryptByteLimitReturn400() throws Exception {
        for (String body : new String[]{signup("invalid", "Umc!1234", "새회원"),
                signup("new@umc.com", "weak", "새회원"), signup("new@umc.com", "Umc!1234", "가"),
                signup("new@umc.com", "Umc!1234", "닉".repeat(13)),
                signup("new@umc.com", "Umc!1234" + "가".repeat(22), "새회원"), "{}"}) {
            mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false))
                    .andExpect(jsonPath("$.code").value("COMMON4001"));
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    @Test void ratingCrudPersistsAndDeleteHasNoBody() throws Exception {
        String response = mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":27205,\"score\":5,\"comment\":\"좋아요\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isSuccess").value(true))
                .andReturn().getResponse().getContentAsString();
        long id = mapper.readTree(response).get("result").asLong();
        mvc.perform(patch("/members/1/ratings/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"score\":3,\"comment\":\"수정 후기\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"));
        mvc.perform(get("/members/1/ratings")).andExpect(jsonPath("$.result[0].ratingId").value(id))
                .andExpect(jsonPath("$.result[0].score").value(3)).andExpect(jsonPath("$.result[0].comment").value("수정 후기"));
        mvc.perform(delete("/members/1/ratings/{id}", id)).andExpect(status().isNoContent()).andExpect(content().string(""));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating WHERE rating_id = ?", Integer.class, id)).isZero();
        mvc.perform(get("/members/1/ratings")).andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test void duplicateRatingAndMissingMember() throws Exception {
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING4091"));
        mvc.perform(post("/members/999/ratings").contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating", Integer.class)).isEqualTo(3);
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "6", "null", "2.5"})
    void invalidScoresAreRejectedOnCreateAndUpdate(String score) throws Exception {
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":27205,\"score\":" + score + "}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        mvc.perform(patch("/members/1/ratings/1").contentType(MediaType.APPLICATION_JSON)
                .content("{\"score\":" + score + "}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(jdbc.queryForObject("SELECT score FROM rating WHERE rating_id=1", Integer.class)).isEqualTo(5);
    }

    @Test void missingRatingAndOwnershipAreCheckedForBothWrites() throws Exception {
        mvc.perform(patch("/members/2/ratings/1").contentType(MediaType.APPLICATION_JSON).content("{\"score\":1}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMON403"));
        mvc.perform(delete("/members/2/ratings/1"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.isSuccess").value(false));
        mvc.perform(patch("/members/1/ratings/999").contentType(MediaType.APPLICATION_JSON).content("{\"score\":1}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("COMMON404"));
        mvc.perform(delete("/members/1/ratings/999"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(jdbc.queryForObject("SELECT score FROM rating WHERE rating_id=1", Integer.class)).isEqualTo(5);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating", Integer.class)).isEqualTo(3);
    }

    @Test void movieIdAndCommentValidation() throws Exception {
        for (String movieId : new String[]{"0", "-1", "null", "1.5"}) {
            mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"movieId\":" + movieId + ",\"score\":5}"))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        }
        String longComment = mapper.writeValueAsString(Map.of("movieId", 27205, "score", 5, "comment", "가".repeat(501)));
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON).content(longComment)).andExpect(status().isBadRequest());
        mvc.perform(patch("/members/1/ratings/1").contentType(MediaType.APPLICATION_JSON).content(longComment)).andExpect(status().isBadRequest());
    }

    @Test void malformedJsonUsesSameEnvelope() throws Exception {
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON).content("{broken"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4002"));
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 5})
    void scoreBoundariesAndFiveHundredCharacterCommentAreAccepted(int score) throws Exception {
        String comment = "가".repeat(500);
        String body = mapper.writeValueAsString(Map.of("movieId", 27205, "score", score, "comment", comment));
        String response = mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = mapper.readTree(response).get("result").asLong();
        assertThat(jdbc.queryForObject("SELECT score FROM rating WHERE rating_id=?", Integer.class, id)).isEqualTo(score);
        assertThat(jdbc.queryForObject("SELECT comment FROM rating WHERE rating_id=?", String.class, id)).isEqualTo(comment);
        mvc.perform(patch("/members/1/ratings/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("score", 6 - score, "comment", comment))))
                .andExpect(status().isOk());
        mvc.perform(get("/members/1/ratings"))
                .andExpect(jsonPath("$.result[0].score").value(6 - score))
                .andExpect(jsonPath("$.result[0].comment").value(comment));
    }

    @Test void omittedCommentOnUpdateClearsTheExistingComment() throws Exception {
        mvc.perform(patch("/members/1/ratings/1").contentType(MediaType.APPLICATION_JSON).content("{\"score\":4}"))
                .andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT comment FROM rating WHERE rating_id=1", String.class)).isNull();
        mvc.perform(get("/members/1/ratings"))
                .andExpect(jsonPath("$.result[1].comment").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test void missingAndEmptyMembersHaveDifferentResponses() throws Exception {
        mvc.perform(get("/members/999/ratings")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COMMON404")).andExpect(jsonPath("$.isSuccess").value(false));
        mvc.perform(get("/members/3/ratings")).andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200")).andExpect(jsonPath("$.result").isEmpty());
    }

    @Test void anotherMemberCanRateTheSameMovie() throws Exception {
        mvc.perform(post("/members/3/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":5}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isSuccess").value(true));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating WHERE movie_id=550", Integer.class)).isEqualTo(3);
    }
}
