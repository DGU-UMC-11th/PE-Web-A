package com.umc.movie.controller;

import com.umc.movie.dto.*;
import com.umc.movie.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    /** 로그인 성공 결과를 공통 200 응답으로 반환한다. */
    @PostMapping("/auth/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("로그인에 성공했습니다.", authService.login(request));
    }
}
