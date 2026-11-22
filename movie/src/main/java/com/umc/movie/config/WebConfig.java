package com.umc.movie.config;

import com.umc.movie.interceptor.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    // 5주차 CORS 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    // 7주차: 토큰 검사 관문 등록
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")          // 일단 전부 잠그고
                .excludePathPatterns(            // 로그인 없이 써야 하는 곳만 열기
                        "/auth/**",              // 로그인
                        "/members",              // 회원가입 (POST /members)
                        "/members/nickname/**",  // 닉네임 중복 체크
                        "/members/email/**",     // 이메일 중복 체크
                        "/members/*/ratings",    // 유저별 평점 조회 (공개)
                        "/error"                 // 스프링 내부 경로
                );
    }
}