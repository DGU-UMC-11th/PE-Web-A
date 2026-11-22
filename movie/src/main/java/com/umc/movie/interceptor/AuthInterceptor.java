package com.umc.movie.interceptor;

import com.umc.movie.exception.ApiException;
import com.umc.movie.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    public static final String MEMBER_ID = "memberId"; // 컨트롤러에서 꺼낼 때 쓸 이름
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    // 컨트롤러가 실행되기 "전"에 불려요. true면 통과, 예외면 여기서 끝.
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 브라우저의 CORS 사전 요청(preflight)에는 토큰이 없으니 그냥 통과
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        // "Bearer {토큰}" 모양이 아니면 토큰이 없는 것으로 봅니다
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2",
                    "로그인이 필요한 요청입니다.");
        }

        // 검증 실패면 JwtUtil이 예외를 던지니, 여기까지 오면 진짜 토큰
        Long memberId = jwtUtil.getMemberId(header.substring(BEARER_PREFIX.length()));

        // 뒤에 오는 컨트롤러가 꺼내 쓸 수 있게 요청에 붙여 둡니다
        request.setAttribute(MEMBER_ID, memberId);
        return true;
    }
}