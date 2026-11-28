package com.umc.movie.controller;

import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieRecordRollbackTest {

    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired FavoriteRepository favorites;
    @Autowired RatingRepository ratings;
    @Autowired JwtUtil jwt;

    private Long memberId;

    @AfterEach
    void cleanUpTestMemberAndRecords() {
        if (memberId == null) {
            return;
        }
        ratings.deleteAll(ratings.findByMember_MemberIdOrderByRatingIdDesc(memberId, Pageable.unpaged()));
        favorites.deleteAll(favorites.findByMember_MemberIdOrderByFavoriteIdDesc(memberId));
        members.deleteById(memberId);
    }

    @Test
    void duplicateFavoriteRollsBackNewRating() throws Exception {
        // given
        var member = members.save(Member.builder()
                .email("movie-rollback@example.com").nickname("rollback").password("unused").build());
        memberId = member.getMemberId();
        String token = jwt.createAccessToken(memberId, member.getEmail());
        long movieId = 550L;
        favorites.save(Favorite.builder().member(member).movieId(movieId).build());
        long ratingCountBefore = ratings.count();
        assertThat(ratings.existsByMember_MemberIdAndMovieId(memberId, movieId)).isFalse();

        // when
        var response = mvc.perform(post("/movie-records")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"movieId":550,"score":5,"addToFavorites":true}
                        """));

        // then
        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        long ratingCountAfter = ratings.count();
        boolean ratingExists = ratings.existsByMember_MemberIdAndMovieId(memberId, movieId);
        assertThat(ratingCountAfter)
                .as("즐겨찾기 충돌 이후 평점 개수 (요청한 평점 존재 여부: %s)", ratingExists)
                .isEqualTo(ratingCountBefore);
        assertThat(ratingExists).isFalse();
    }
}
