package com.umc.movie.interceptor;

import com.umc.movie.exception.ApiException;
import com.umc.movie.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {
    public static final String MEMBER_ID = "memberId";
    private final JwtUtil jwtUtil;

    /** 공개 API만 통과시키고, 나머지는 검증된 토큰의 회원 ID를 요청 속성에 넣는다. */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String method = request.getMethod();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if ("OPTIONS".equals(method)) return true;
        if ("POST".equals(method) && (path.equals("/auth/login") || path.equals("/members"))) return true;
        if ("GET".equals(method) && (path.matches("/members/(email|nickname)/[^/]+")
                || path.matches("/members/[0-9]+/ratings"))) return true;
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ") || header.substring(7).isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2", "로그인이 필요한 요청입니다.");
        }
        request.setAttribute(MEMBER_ID, jwtUtil.getMemberId(header.substring(7)));
        return true;
    }
}
