package com.umc.movie;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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

    /** 기존 닉네임과 새 닉네임의 사용 가능 여부를 검증한다. */
    @Test void nicknameAvailability() throws Exception {
        mvc.perform(get("/members/nickname/{nickname}", "수현")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(false));
        mvc.perform(get("/members/nickname/{nickname}", "새회원")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(true));
    }
    /** 기존 이메일과 새 이메일의 사용 가능 여부를 검증한다. */
    @Test void emailAvailability() throws Exception {
        mvc.perform(get("/members/email/noco@umc.com")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(false));
        mvc.perform(get("/members/email/new@umc.com")).andExpect(status().isOk()).andExpect(jsonPath("$.result.available").value(true));
    }
    /** 회원별 필터와 최신순 정렬, 응답 DTO 필드를 검증한다. */
    @Test void ratingsAreFilteredSortedAndMappedToDto() throws Exception {
        mvc.perform(get("/members/1/ratings")).andExpect(status().isOk())
            .andExpect(jsonPath("$.result.length()").value(2))
            .andExpect(jsonPath("$.result[0].ratingId").value(2))
            .andExpect(jsonPath("$.result[0].movieId").value(155))
            .andExpect(jsonPath("$.result[0].score").value(4))
            .andExpect(jsonPath("$.result[0].comment").value("다시 봐도 명작"))
            .andExpect(jsonPath("$.result[0].createdAt").exists())
            .andExpect(jsonPath("$.result[0].updatedAt").exists())
            .andExpect(jsonPath("$.result[0].member").doesNotExist())
            .andExpect(jsonPath("$.result[0].password").doesNotExist())
            .andExpect(jsonPath("$.result[1].ratingId").value(1));
    }
    /** 평점이 없는 기존 회원의 조회 결과가 빈 목록인지 검증한다. */
    @Test void existingMemberWithoutRatingsReturnsEmptyArray() throws Exception {
        mvc.perform(get("/members/3/ratings")).andExpect(status().isOk()).andExpect(jsonPath("$.result").isEmpty());
    }
    /** 존재하지 않는 회원의 조회가 404인지 검증한다. */
    @Test void missingMemberReturns404() throws Exception {
        mvc.perform(get("/members/999/ratings")).andExpect(status().isNotFound());
    }
    /** 숫자가 아닌 회원 ID가 400으로 거절되는지 검증한다. */
    @Test void invalidMemberIdReturns400() throws Exception {
        mvc.perform(get("/members/invalid/ratings")).andExpect(status().isBadRequest());
    }
    /** 허용된 origin의 GET과 프리플라이트 응답 헤더를 검증한다. */
    @Test void allowedOriginReceivesCorsHeader() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://localhost:5173"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mvc.perform(options("/members/1/ratings").header("Origin", "http://localhost:5173")
            .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
    /** 허용되지 않은 origin의 요청을 거절하는지 검증한다. */
    @Test void otherOriginIsRejected() throws Exception {
        mvc.perform(get("/members/1/ratings").header("Origin", "http://untrusted.example"))
            .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    /** PATCH와 DELETE의 프리플라이트 허용 헤더를 각각 검증한다. */
    @ParameterizedTest
    @ValueSource(strings = {"PATCH", "DELETE"})
    void writePreflightMethodsAreAllowed(String method) throws Exception {
        mvc.perform(options("/members/1/ratings/1").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", method))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString(method)));
    }
}
