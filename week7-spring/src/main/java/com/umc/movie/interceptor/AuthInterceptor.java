package com.umc.movie.interceptor;

import com.umc.movie.exception.ApiException;
import com.umc.movie.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {
    public static final String MEMBER_ID = "authenticatedMemberId";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String method = request.getMethod();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if ("OPTIONS".equals(method) || isPublicRequest(method, path)) {
            return true;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2", "로그인이 필요한 요청입니다.");
        }
        Long memberId = jwtUtil.getMemberId(header.substring(BEARER_PREFIX.length()));
        request.setAttribute(MEMBER_ID, memberId);
        return true;
    }

    private boolean isPublicRequest(String method, String path) {
        if ("POST".equals(method)) {
            return "/auth/login".equals(path) || "/members".equals(path);
        }
        return "GET".equals(method) && (path.startsWith("/members/nickname/")
                || path.startsWith("/members/email/") || path.matches("/members/[0-9]+/ratings"));
    }
}
