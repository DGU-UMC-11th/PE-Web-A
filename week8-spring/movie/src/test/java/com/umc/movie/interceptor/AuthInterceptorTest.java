package com.umc.movie.interceptor;

import com.umc.movie.exception.ApiException;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class AuthInterceptorTest {
    /** 스킴의 대소문자와 무관하게 원본 JWT 문자열을 검증기에 전달한다. */
    @ParameterizedTest
    @ValueSource(strings = {"Bearer", "bearer", "BEARER", "bEaReR"})
    void acceptsSchemeWithoutChangingToken(String scheme) {
        JwtUtil jwt = mock(JwtUtil.class);
        String token = "AbC.Def.GhI";
        when(jwt.getMemberId(token)).thenReturn(3L);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/members/me");
        request.addHeader("Authorization", scheme + " " + token);
        assertThat(new AuthInterceptor(jwt).preHandle(request, new MockHttpServletResponse(), new Object())).isTrue();
        assertThat(request.getAttribute(AuthInterceptor.MEMBER_ID)).isEqualTo(3L);
        verify(jwt).getMemberId(token);
    }

    /** 빈 토큰과 다른 인증 스킴은 기존 인증 누락 오류로 거절한다. */
    @ParameterizedTest
    @ValueSource(strings = {"Bearer", "bearer ", "BEARER   ", "Basic abc"})
    void rejectsEmptyTokenAndOtherSchemes(String header) {
        JwtUtil jwt = mock(JwtUtil.class);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/members/me");
        request.addHeader("Authorization", header);
        assertThatThrownBy(() -> new AuthInterceptor(jwt).preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOfSatisfying(ApiException.class, ex -> assertThat(ex.getCode()).isEqualTo("AUTH401_2"));
        verifyNoInteractions(jwt);
    }
}
