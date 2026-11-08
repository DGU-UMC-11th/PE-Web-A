package com.umc.movie;
import com.umc.movie.config.WebConfig;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(properties = "app.cors.allowed-origins=*")
@Import(WebConfig.class)
class WildcardCorsTests {
    @Autowired MockMvc mvc;
    @MockitoBean MemberService members;
    @MockitoBean RatingService ratings;
    @Test void wildcardAllowsBothDemoOrigins() throws Exception {
        when(members.checkNickname("suhyun")).thenReturn(new NicknameCheckResponse(true));
        for (String origin : new String[]{"http://localhost:5500", "http://127.0.0.1:5500"}) {
            mvc.perform(get("/members/nickname/suhyun").header("Origin", origin))
                    .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "*"));
        }
    }
}
