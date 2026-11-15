
package com.umc.movie.config;

import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.resolver.LoginMemberArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final LoginMemberArgumentResolver loginMemberArgumentResolver;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    // 기존 CORS 설정 유지
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/members/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST")
                .maxAge(3600);
    }

    // 7주차 JWT 인증 설정 유지
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/**",
                        "/members",
                        "/members/nickname/**",
                        "/members/email/**",
                        "/members/*/ratings",
                        "/error"
                );
    }

    // 선택 미션: @LoginMember 처리기 등록
    @Override
    public void addArgumentResolvers(
            List<HandlerMethodArgumentResolver> resolvers
    ) {
        resolvers.add(loginMemberArgumentResolver);
    }
}
