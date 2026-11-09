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
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@Transactional
class MemberRatingRegressionTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;

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

    @Test void ratingCreatePaginationUpdateOwnershipAndDeleteStillWork() throws Exception {
        long owner = signUp("owner@example.com", "owner");
        long other = signUp("other@example.com", "other");
        String base = "/members/" + owner + "/ratings";
        var created = mvc.perform(post(base).contentType("application/json")
                        .content("{\"movieId\":10,\"score\":4,\"comment\":\"good\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("COMMON201"))
                .andReturn();
        long rating = json.readTree(created.getResponse().getContentAsString()).path("result").asLong();
        mvc.perform(post(base).contentType("application/json").content("{\"movieId\":10,\"score\":3}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON4092"));
        mvc.perform(get(base + "?page=0&size=1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.content[0].score").value(4));
        mvc.perform(get(base + "?page=1&size=1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
        mvc.perform(patch("/members/" + other + "/ratings/" + rating).contentType("application/json")
                        .content("{\"score\":5}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMON403"));
        mvc.perform(delete("/members/" + other + "/ratings/" + rating)).andExpect(status().isForbidden());
        mvc.perform(patch(base + "/" + rating).contentType("application/json").content("{\"score\":5}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"));
        mvc.perform(get(base)).andExpect(jsonPath("$.content[0].score").value(5));
        mvc.perform(delete(base + "/" + rating)).andExpect(status().isNoContent());
        mvc.perform(delete(base + "/" + rating)).andExpect(status().isNotFound());
        mvc.perform(get(base)).andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test void invalidSignupAndRatingInputsRemain400() throws Exception {
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"invalid\",\"nickname\":\"valid\",\"password\":\"Aa1!23456\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
        mvc.perform(post("/members").contentType("application/json")
                        .content("{\"email\":\"valid@example.com\",\"nickname\":\"valid\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/members/1/ratings").contentType("application/json")
                        .content("{\"movieId\":1,\"score\":6}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
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
