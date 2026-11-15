package com.umc.movie.config;

import com.umc.movie.auth.LoginMemberArgumentResolver;
import com.umc.movie.interceptor.AuthInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.*;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuthInterceptor authInterceptor;
    private final LoginMemberArgumentResolver loginMemberArgumentResolver;
    private final String allowedOrigin;
    private final boolean corsEnabled;

    public WebConfig(AuthInterceptor authInterceptor, LoginMemberArgumentResolver loginMemberArgumentResolver,
                     @Value("${app.cors.allowed-origin}") String allowedOrigin,
                     @Value("${app.cors.enabled:true}") boolean corsEnabled) {
        this.authInterceptor = authInterceptor;
        this.loginMemberArgumentResolver = loginMemberArgumentResolver;
        this.allowedOrigin = allowedOrigin;
        this.corsEnabled = corsEnabled;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (corsEnabled) {
            registry.addMapping("/**").allowedOrigins(allowedOrigin)
                    .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS").allowedHeaders("*");
        }
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor).addPathPatterns("/**").excludePathPatterns("/error");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginMemberArgumentResolver);
    }
}
