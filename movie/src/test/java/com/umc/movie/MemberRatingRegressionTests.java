package com.umc.movie;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:regression;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=login-regression-test-key-at-least-32-bytes",
        "jwt.access-expiration=3600"
})
@AutoConfigureMockMvc
@Transactional
class MemberRatingRegressionTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;

    @Test void browserCanSaveAndReloadNickname() throws Exception {
        String origin = "http://localhost:5173";
        signUp("profile@example.com", "original");
        var login = mvc.perform(post("/auth/login").contentType("application/json")
                        .content("{\"email\":\"profile@example.com\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isOk()).andReturn();
        String authorization = "Bearer " + json.readTree(login.getResponse().getContentAsString())
                .path("result").path("accessToken").asText();

        mvc.perform(options("/members/me").header("Origin", origin)
                        .header("Access-Control-Request-Method", "PATCH")
                        .header("Access-Control-Request-Headers", "authorization, content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin));

        mvc.perform(patch("/members/me").header("Origin", origin)
                        .header("Authorization", authorization).contentType("application/json")
                        .content("{\"nickname\":\"changed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.nickname").value("changed"));
        mvc.perform(get("/members/me").header("Origin", origin).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.nickname").value("changed"));
    }

    @Test void browserCanLogInWithRegisteredCredentials() throws Exception {
        String origin = "http://localhost:5173";
        signUp("login@example.com", "loginmember");

        mvc.perform(options("/auth/login")
                        .header("Origin", origin)
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin));

        mvc.perform(post("/auth/login").header("Origin", origin)
                        .contentType("application/json")
                        .content("{\"email\":\"login@example.com\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin))
                .andExpect(jsonPath("$.result.accessToken").isNotEmpty());
    }

    @Test void signupAvailabilityAndPasswordEncryptionStillWork() throws Exception {
        mvc.perform(get("/members/email/member@example.com")).andExpect(jsonPath("$.available").value(true));
        long memberId = signUp("member@example.com", "member");
        var saved = members.findById(memberId).orElseThrow();
        assertThat(encoder.matches("Aa1!23456", saved.getPassword())).isTrue();
        mvc.perform(get("/members/email/member@example.com")).andExpect(jsonPath("$.available").value(false));
        mvc.perform(get("/members/nickname/member")).andExpect(jsonPath("$.available").value(false));
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"member@example.com\",\"nickname\":\"other\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4091"));
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"other@example.com\",\"nickname\":\"member\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER4092"));
    }

    @Test void favoritesAreScopedToTheSignedInMember() throws Exception {
        signUp("favorite@example.com", "favorite");
        signUp("otherfav@example.com", "otherfav");
        String origin = "http://localhost:5173";
        String owner = signIn("favorite@example.com");
        String other = signIn("otherfav@example.com");

        mvc.perform(get("/favorites")).andExpect(status().isUnauthorized());
        mvc.perform(options("/favorites").header("Origin", origin)
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization, content-type"))
                .andExpect(status().isOk());
        mvc.perform(get("/favorites/10").header("Authorization", owner))
                .andExpect(jsonPath("$.result.favorited").value(false));
        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(post("/favorites").header("Authorization", owner).contentType("application/json")
                            .content("{\"movieId\":10}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.result.favorited").value(true));
        }
        mvc.perform(get("/favorites").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.length()").value(1))
                .andExpect(jsonPath("$.result[0]").value(10));
        mvc.perform(get("/favorites").header("Authorization", other))
                .andExpect(jsonPath("$.result").isEmpty());
        mvc.perform(delete("/favorites/10").header("Authorization", other))
                .andExpect(status().isNoContent());
        mvc.perform(get("/favorites/10").header("Authorization", owner))
                .andExpect(jsonPath("$.result.favorited").value(true));
        mvc.perform(delete("/favorites/10").header("Authorization", owner))
                .andExpect(status().isNoContent());
        mvc.perform(get("/favorites").header("Authorization", owner))
                .andExpect(jsonPath("$.result").isEmpty());
    }

    @Test void ratingCreatePaginationUpdateOwnershipAndDeleteStillWork() throws Exception {
        long ownerId = signUp("owner@example.com", "owner");
        signUp("other@example.com", "other");
        String owner = signIn("owner@example.com");
        String other = signIn("other@example.com");
        String base = "/members/" + ownerId + "/ratings";
        var created = mvc.perform(post("/ratings").header("Authorization", owner).contentType("application/json")
                        .content("{\"movieId\":10,\"score\":4,\"comment\":\"good\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("COMMON201"))
                .andReturn();
        long ratingId = json.readTree(created.getResponse().getContentAsString()).path("result").path("ratingId").asLong();
        String ratingPath = "/ratings/" + ratingId;
        mvc.perform(post("/ratings").header("Authorization", owner).contentType("application/json")
                        .content("{\"movieId\":10,\"score\":3}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING409_1"));
        mvc.perform(get(base + "?page=0&size=1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.content[0].score").value(4));
        mvc.perform(get(base + "?page=1&size=1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
        mvc.perform(patch(ratingPath).header("Authorization", other).contentType("application/json")
                        .content("{\"score\":5}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("RATING403_1"));
        mvc.perform(delete(ratingPath).header("Authorization", other)).andExpect(status().isForbidden());
        mvc.perform(patch(ratingPath).header("Authorization", owner).contentType("application/json")
                        .content("{\"score\":5}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"));
        mvc.perform(get(base)).andExpect(jsonPath("$.content[0].score").value(5));
        mvc.perform(delete(ratingPath).header("Authorization", owner)).andExpect(status().isOk());
        mvc.perform(get(base)).andExpect(jsonPath("$.content").isEmpty());
        mvc.perform(delete(ratingPath).header("Authorization", owner)).andExpect(status().isNotFound());
    }

    @Test void invalidSignupAndRatingInputsRemain400() throws Exception {
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"invalid\",\"nickname\":\"valid\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"valid@example.com\",\"nickname\":\"valid\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
        signUp("invalidrating@example.com", "validuser");
        mvc.perform(post("/ratings").header("Authorization", signIn("invalidrating@example.com"))
                        .contentType("application/json").content("{\"movieId\":1,\"score\":6}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
    }

    private String signIn(String email) throws Exception {
        var result = mvc.perform(post("/auth/login").contentType("application/json")
                        .content(json.writeValueAsString(java.util.Map.of("email", email, "password", "Aa1!23456"))))
                .andExpect(status().isOk()).andReturn();
        return "Bearer " + json.readTree(result.getResponse().getContentAsString())
                .path("result").path("accessToken").asText();
    }

    private long signUp(String email, String nickname) throws Exception {
        var result = mvc.perform(post("/members").contentType("application/json")
                        .content(json.writeValueAsString(java.util.Map.of("email", email,
                                "nickname", nickname, "password", "Aa1!23456"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.password").doesNotExist()).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("result").path("memberId").asLong();
    }
}
