package com.umc.movie;

import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:week8;MODE=MySQL",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=week8-test-key-for-integration-tests-only"
})
@AutoConfigureMockMvc
class Week8ApiTests {

    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired RatingRepository ratings;
    @Autowired JwtUtil jwt;

    @Test
    void favoritesUseTheTokenOwnerAndReturnNewestFirst() throws Exception {
        String owner = bearer(createMember("owner8"));
        Member other = createMember("other8");
        String otherToken = bearer(other);

        mvc.perform(post("/favorites").contentType("application/json").content("{\"movieId\":550}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_2"));
        mvc.perform(post("/favorites").header("Authorization", owner)
                        .contentType("application/json").content("{\"movieId\":0}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
        mvc.perform(get("/favorites/550").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(false));
        mvc.perform(post("/favorites").header("Authorization", owner).contentType("application/json")
                        .content("{\"movieId\":550,\"memberId\":" + other.getMemberId() + "}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.result.createdAt").isString());
        mvc.perform(post("/favorites").header("Authorization", owner).contentType("application/json")
                        .content("{\"movieId\":550}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        mvc.perform(post("/favorites").header("Authorization", owner).contentType("application/json")
                        .content("{\"movieId\":551}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/favorites").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result[0].movieId").value(551))
                .andExpect(jsonPath("$.result[1].movieId").value(550));
        mvc.perform(get("/favorites").header("Authorization", otherToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result").isEmpty());
        mvc.perform(delete("/favorites/550").header("Authorization", otherToken))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("FAVORITE404_1"));
        mvc.perform(get("/favorites/550").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(true));
        mvc.perform(delete("/favorites/550").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(content().json("""
                        {"isSuccess":true,"code":"COMMON200","message":"즐겨찾기를 해제했습니다.","result":null}
                        """));
        mvc.perform(get("/favorites/550").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(false));
    }

    @Test
    void movieRecordCommitsBothOrRollsBackTheInsertedRating() throws Exception {
        Member member = createMember("record8");
        String token = bearer(member);
        mvc.perform(post("/movie-records").header("Authorization", token).contentType("application/json")
                        .content("{\"movieId\":238,\"score\":5,\"addToFavorites\":true}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.result.rating.movieId").value(238))
                .andExpect(jsonPath("$.result.favorite.movieId").value(238));
        mvc.perform(post("/movie-records").header("Authorization", token).contentType("application/json")
                        .content("{\"movieId\":238,\"score\":5,\"addToFavorites\":true}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING409_1"));
        mvc.perform(post("/favorites").header("Authorization", token).contentType("application/json")
                        .content("{\"movieId\":550}")).andExpect(status().isCreated());
        mvc.perform(post("/movie-records").header("Authorization", token).contentType("application/json")
                        .content("{\"movieId\":550,\"score\":5,\"addToFavorites\":true}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("FAVORITE409_1"));
        assertThat(ratings.existsByMember_MemberIdAndMovieId(member.getMemberId(), 550L)).isFalse();
        mvc.perform(post("/movie-records").header("Authorization", token).contentType("application/json")
                        .content("{\"movieId\":551,\"score\":5,\"addToFavorites\":false}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.result.favorite").isEmpty());
        mvc.perform(get("/favorites/551").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(false));
    }

    @Test
    void swaggerIsPublicAndDocumentsBearerAuthForProtectedOperations() throws Exception {
        // given
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
        var protectedOperations = List.of(
                "$.paths['/ratings'].post",
                "$.paths['/ratings/{ratingId}'].patch",
                "$.paths['/ratings/{ratingId}'].delete",
                "$.paths['/members/me'].get",
                "$.paths['/members/me'].patch",
                "$.paths['/favorites'].get",
                "$.paths['/favorites/{movieId}'].get",
                "$.paths['/favorites/{movieId}'].delete"
        );
        String publicRatings = "$.paths['/members/{memberId}/ratings'].get";

        // when
        var docs = mvc.perform(get("/v3/api-docs"));

        // then
        docs
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.paths['/favorites'].post.security[0].bearerAuth").isArray())
                .andExpect(jsonPath("$.paths['/favorites'].post.parameters").doesNotExist())
                .andExpect(jsonPath("$.paths['/favorites/{movieId}'].delete.responses['200']").exists())
                .andExpect(jsonPath("$.paths['/movie-records'].post.responses['409'].description")
                        .value(org.hamcrest.Matchers.containsString("RATING409_1")))
                .andExpect(jsonPath("$.paths['/movie-records'].post.responses['201'].content['application/json'].examples").exists())
                .andExpect(jsonPath("$.paths['/auth/login'].post.security").doesNotExist());

        for (String operation : protectedOperations) {
            docs.andExpect(jsonPath(operation + ".description").exists())
                    .andExpect(jsonPath(operation + ".security[0].bearerAuth").isArray())
                    .andExpect(jsonPath(operation + ".responses['401'].description")
                            .value(org.hamcrest.Matchers.containsString("AUTH401_2")));
        }
        docs.andExpect(jsonPath("$.security").doesNotExist())
                .andExpect(jsonPath(publicRatings + ".security").doesNotExist())
                .andExpect(jsonPath(publicRatings + ".description")
                        .value(org.hamcrest.Matchers.containsString("JWT 없이")))
                .andExpect(jsonPath(publicRatings + ".responses['200'].content['*/*'].schema['$ref']")
                        .value("#/components/schemas/RatingPageResponse"))
                .andExpect(jsonPath(publicRatings + ".responses['404'].description")
                        .value(org.hamcrest.Matchers.containsString("MEMBER404_1")))
                .andExpect(jsonPath("$.paths['/ratings'].post.responses['409'].description")
                        .value(org.hamcrest.Matchers.containsString("RATING409_1")))
                .andExpect(jsonPath("$.paths['/ratings/{ratingId}'].patch.responses['403'].description")
                        .value(org.hamcrest.Matchers.containsString("RATING403_1")))
                .andExpect(jsonPath("$.paths['/members/me'].patch.responses['409'].description")
                        .value(org.hamcrest.Matchers.containsString("MEMBER409_1")));
    }

    private Member createMember(String nickname) {
        return members.save(Member.builder().email(nickname + "@example.com")
                .nickname(nickname).password("unused").build());
    }

    private String bearer(Member member) {
        return "Bearer " + jwt.createAccessToken(member.getMemberId(), member.getEmail());
    }
}
