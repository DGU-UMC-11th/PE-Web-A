package com.umc.movie.controller;

import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RatingApiTest {

    private static final String RATING_REQUEST = """
            {"movieId":550,"score":5,"comment":"재관람 후기"}
            """;

    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired JwtUtil jwt;

    @Test
    void creatingRatingWithoutTokenReturns401() throws Exception {
        // given
        var request = post("/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(RATING_REQUEST);

        // when
        var response = mvc.perform(request);

        // then
        response.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @Test
    void creatingRatingWithValidTokenReturns201() throws Exception {
        // given
        var member = members.save(Member.builder()
                .email("rating-api@example.com").nickname("ratingApi").password("unused").build());
        String token = jwt.createAccessToken(member.getMemberId(), member.getEmail());

        // when
        var response = mvc.perform(post("/ratings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(RATING_REQUEST));

        // then
        response.andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550))
                .andExpect(jsonPath("$.result.score").value(5));
    }
}
