package com.umc.movie;

import com.umc.movie.config.WebConfig;
import com.umc.movie.dto.*;
import com.umc.movie.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import(WebConfig.class)
class MemberApiTests {
    @Autowired MockMvc mvc;
    @MockitoBean MemberService members;
    @MockitoBean RatingService ratings;

    @Test void validNicknameAndEmail() throws Exception {
        when(members.checkNickname("suhyun")).thenReturn(new NicknameCheckResponse(true));
        when(members.checkEmail("suhyun@example.com")).thenReturn(new EmailCheckResponse(false));
        mvc.perform(get("/members/nickname/suhyun")).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(true));
        mvc.perform(get("/members/email/suhyun@example.com")).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
    }

    @Test void invalidInputsNeverReachService() throws Exception {
        for (String nickname : List.of("a", "abcdefghijklm")) {
            mvc.perform(get("/members/nickname/" + nickname)).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.isSuccess").value(false))
                    .andExpect(jsonPath("$.code").value("COMMON4001"))
                    .andExpect(jsonPath("$.message").value("닉네임은 2~12자여야 합니다."))
                    .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.nullValue()));
        }
        mvc.perform(get("/members/email/invalid-email")).andExpect(status().isBadRequest());
        verifyNoInteractions(members);
    }

    @Test void nicknameBoundaries() throws Exception {
        for (String nickname : List.of("ab", "abcdefghijkl")) {
            when(members.checkNickname(nickname)).thenReturn(new NicknameCheckResponse(true));
            mvc.perform(get("/members/nickname/" + nickname)).andExpect(status().isOk());
        }
    }

    @Test void paginationAndBounds() throws Exception {
        when(ratings.getRatingsByMember(1L, 1, 2)).thenReturn(new RatingPageResponse(List.of(), 1, 2, 2, 1, false, true));
        mvc.perform(get("/members/1/ratings?page=1&size=2")).andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1)).andExpect(jsonPath("$.totalElements").value(2));
        for (String query : List.of("page=-1", "size=0", "size=101", "page=abc")) {
            mvc.perform(get("/members/1/ratings?" + query)).andExpect(status().isBadRequest());
        }
        verify(ratings, times(1)).getRatingsByMember(anyLong(), anyInt(), anyInt());
    }

    @Test void onlyConfiguredOriginCanReadResponse() throws Exception {
        when(members.checkNickname("suhyun")).thenReturn(new NicknameCheckResponse(true));
        mvc.perform(get("/members/nickname/suhyun").header("Origin", "http://localhost:5500"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5500"));
        mvc.perform(get("/members/nickname/suhyun").header("Origin", "http://127.0.0.1:5500"))
                .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
