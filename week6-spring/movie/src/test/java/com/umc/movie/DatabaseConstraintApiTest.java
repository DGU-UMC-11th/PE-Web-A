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
import static org.mockito.Mockito.doAnswer;
import static org.mockito.ArgumentMatchers.any;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
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
    /** 사전 검사를 통과한 중복 이메일을 실제 DB 제약이 막는지 검증한다. */
    @Test void databaseRejectsDuplicateEmailAfterPrecheck() throws Exception {
        doReturn(false).when(members).existsByEmail("noco@umc.com");
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"noco@umc.com\",\"password\":\"Umc!1234\",\"nickname\":\"새회원\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON4091"))
                .andExpect(jsonPath("$.isSuccess").value(false));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    /** 사전 검사를 통과한 중복 닉네임을 실제 DB 제약이 막는지 검증한다. */
    @Test void databaseRejectsDuplicateNicknameAfterPrecheck() throws Exception {
        doReturn(false).when(members).existsByNickname("수현");
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@umc.com\",\"password\":\"Umc!1234\",\"nickname\":\"수현\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON4091"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }

    /** 실제 복합 UNIQUE 위반이 전용 평점 충돌 코드로 변환되고 롤백되는지 검증한다. */
    @Test void databaseRejectsDuplicateRatingAfterPrecheck() throws Exception {
        doReturn(false).when(ratings).existsByMember_MemberIdAndMovieId(1L, 550L);
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING4091"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating WHERE member_id=1 AND movie_id=550", Integer.class)).isEqualTo(1);
    }

    /** 실제 외래 키 위반이 중복 오류가 아닌 무결성 오류로 응답되는지 검증한다. */
    @Test void foreignKeyViolationIsNotReportedAsDuplicate() throws Exception {
        doAnswer(invocation -> {
            jdbc.update("INSERT INTO rating(member_id,movie_id,score) VALUES (999,27205,4)");
            return null;
        }).when(ratings).saveAndFlush(any(Rating.class));
        mvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"movieId\":27205,\"score\":4}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4003"))
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.nullValue()));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM rating", Integer.class)).isEqualTo(3);
    }

    /** 실제 컬럼 길이 초과가 중복 오류가 아닌 무결성 오류로 응답되는지 검증한다. */
    @Test void columnLengthViolationIsNotReportedAsDuplicate() throws Exception {
        doAnswer(invocation -> {
            jdbc.update("INSERT INTO member(email,password,nickname) VALUES (?,?,?)",
                    "too-long@umc.com", "x".repeat(61), "새회원");
            return null;
        }).when(members).saveAndFlush(any(Member.class));
        mvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@umc.com\",\"password\":\"Umc!1234\",\"nickname\":\"새회원\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4003"))
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.nullValue()));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM member", Integer.class)).isEqualTo(3);
    }
}
