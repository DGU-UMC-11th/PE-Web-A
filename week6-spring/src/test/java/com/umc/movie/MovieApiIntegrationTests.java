package com.umc.movie;

import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MovieApiIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;

    @Test void duplicateNickname() throws Exception {
        mvc.perform(get("/members/nickname/{nickname}", "수현"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
    }
    @Test void availableNickname() throws Exception {
        mvc.perform(get("/members/nickname/unused_5week_test"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.available").value(true));
    }
    @Test void duplicateEmail() throws Exception {
        mvc.perform(get("/members/email/noco@umc.com"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
    }
    @Test void availableEmail() throws Exception {
        mvc.perform(get("/members/email/unused_5week_test@example.com"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.available").value(true));
    }
    @Test void ratingsAreSortedAndOnlyExposeDtoFields() throws Exception {
        mvc.perform(get("/members/1/ratings"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].movieId").value(155))
                .andExpect(jsonPath("$[1].movieId").value(550))
                .andExpect(jsonPath("$[0].length()").value(6))
                .andExpect(jsonPath("$[0].createdAt").isString())
                .andExpect(jsonPath("$[0].updatedAt").isString())
                .andExpect(jsonPath("$[0].member").doesNotExist());
    }
    @Test void existingMemberWithoutRatingsReturnsEmptyArray() throws Exception {
        Member member=members.saveAndFlush(new Member("empty_5week_test@example.com", "dummy", "empty_5week_test"));
        mvc.perform(get("/members/{id}/ratings", member.getMemberId()))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }
    @Test void missingMemberReturns404() throws Exception {
        mvc.perform(get("/members/9223372036854775807/ratings"))
                .andExpect(status().isNotFound());
    }
    @Test void invalidMemberIdReturns400() throws Exception {
        mvc.perform(get("/members/abc/ratings")).andExpect(status().isBadRequest());
    }
    @Test void allowedOriginGetsCorsHeader() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://localhost:5175"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5175"));
    }
    @Test void otherOriginIsRejected() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://untrusted.example"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
    @Test void preflightIsAllowed() throws Exception {
        mvc.perform(options("/members/1/ratings").header("Origin", "http://localhost:5175")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5175"));
    }
}
