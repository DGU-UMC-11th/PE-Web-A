package com.umc.movie;

import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:constraints;MODE=MySQL;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql("/seed-test.sql")
class DatabaseConstraintApiTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @MockitoSpyBean MemberRepository members;
    @MockitoSpyBean RatingRepository ratings;

    // 중복 검사 직후 다른 요청이 저장한 경우처럼, 사전 검사만 통과시킵니다.
    // saveAndFlush와 DB UNIQUE 제약은 실제 실행합니다.
    @Test void databaseRejectsDuplicateEmailAfterPrecheck() throws Exception {
        doReturn(false).when(members).existsByEmail("noco@umc.com");
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"noco@umc.com\",\"password\":\"Umc!1234\",\"nickname\":\"새회원\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON4091"))
                .andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    @Test void databaseRejectsDuplicateNicknameAfterPrecheck() throws Exception {
        doReturn(false).when(members).existsByNickname("수현");
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@umc.com\",\"password\":\"Umc!1234\",\"nickname\":\"수현\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON4091"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    @Test void databaseRejectsDuplicateRatingAfterPrecheck() throws Exception {
        doReturn(false).when(ratings).existsByMember_MemberIdAndMovieId(1L, 550L);
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING4091"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating WHERE member_id=1 AND movie_id=550", Integer.class)).isEqualTo(1);
    }
}
