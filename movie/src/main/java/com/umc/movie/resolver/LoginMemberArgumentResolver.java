
package com.umc.movie.resolver;

import com.umc.movie.annotation.LoginMember;
import com.umc.movie.exception.ApiException;
import com.umc.movie.interceptor.AuthInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
public class LoginMemberArgumentResolver
        implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginMember.class)
                && Long.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        HttpServletRequest request =
                webRequest.getNativeRequest(HttpServletRequest.class);

        if (request == null) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_2",
                    "로그인이 필요한 요청입니다."
            );
        }

        Object memberId =
                request.getAttribute(AuthInterceptor.MEMBER_ID);

        if (!(memberId instanceof Long)) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_2",
                    "로그인이 필요한 요청입니다."
            );
        }

        return memberId;
    }
}
