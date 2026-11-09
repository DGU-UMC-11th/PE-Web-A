package com.umc.movie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql("/seed-test.sql")
class MemberApiTest {
    @Autowired MockMvc mvc;

    @Test void nicknameAvailability() throws Exception {
        mvc.perform(get("/members/nickname/{nickname}", "수현")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(false));
        mvc.perform(get("/members/nickname/{nickname}", "새회원")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(true));
    }
    @Test void emailAvailability() throws Exception {
        mvc.perform(get("/members/email/noco@umc.com")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(false));
        mvc.perform(get("/members/email/new@umc.com")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(true));
    }
    @Test void ratingsAreFilteredSortedAndMappedToDto() throws Exception {
        mvc.perform(get("/members/1/ratings")).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].ratingId").value(2))
            .andExpect(jsonPath("$[0].movieId").value(155))
            .andExpect(jsonPath("$[0].score").value(4))
            .andExpect(jsonPath("$[0].comment").value("다시 봐도 명작"))
            .andExpect(jsonPath("$[0].createdAt").exists())
            .andExpect(jsonPath("$[0].updatedAt").exists())
            .andExpect(jsonPath("$[0].member").doesNotExist())
            .andExpect(jsonPath("$[0].password").doesNotExist())
            .andExpect(jsonPath("$[1].ratingId").value(1));
    }
    @Test void existingMemberWithoutRatingsReturnsEmptyArray() throws Exception {
        mvc.perform(get("/members/3/ratings")).andExpect(status().isOk()).andExpect(content().json("[]"));
    }
    @Test void missingMemberReturns404() throws Exception {
        mvc.perform(get("/members/999/ratings")).andExpect(status().isNotFound());
    }
    @Test void invalidMemberIdReturns400() throws Exception {
        mvc.perform(get("/members/invalid/ratings")).andExpect(status().isBadRequest());
    }
    @Test void allowedOriginReceivesCorsHeader() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://localhost:5173"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mvc.perform(options("/members/1/ratings").header("Origin", "http://localhost:5173")
            .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
    @Test void otherOriginIsRejected() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://untrusted.example"))
            .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
