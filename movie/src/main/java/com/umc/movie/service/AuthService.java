package com.umc.movie.service;

import com.umc.movie.dto.LoginRequest;
import com.umc.movie.dto.LoginResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // 6주차 PasswordConfig에서 만든 것
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        // 1. 이메일로 회원 찾기 (없어도 "없는 이메일"이라고 알려주지 않음)
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_1",
                        "이메일 또는 비밀번호가 올바르지 않습니다."));

        // 2. 입력한 비밀번호를 저장된 해시와 비교
        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_1",
                    "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // 3. 통과! 토큰 발급
        String accessToken = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
        return new LoginResponse(member.getNickname(), accessToken);
    }
}