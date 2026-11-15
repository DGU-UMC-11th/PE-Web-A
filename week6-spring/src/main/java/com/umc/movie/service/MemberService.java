package com.umc.movie.service;

import com.umc.movie.dto.*;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public NicknameCheckResponse checkNickname(String nickname) {
        return new NicknameCheckResponse(!memberRepository.existsByNickname(nickname));
    }

    public EmailCheckResponse checkEmail(String email) {
        return new EmailCheckResponse(!memberRepository.existsByEmail(email));
    }

    @Transactional
    public MemberResponse signUp(SignUpRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호는 UTF-8 기준 72바이트 이하로 입력해주세요.");
        }
        if (memberRepository.existsByEmail(request.email())) {
            throw new BusinessException(HttpStatus.CONFLICT, "MEMBER4091", "이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByNickname(request.nickname())) {
            throw new BusinessException(HttpStatus.CONFLICT, "MEMBER4092", "이미 사용 중인 닉네임입니다.");
        }
        Member member = new Member(request.email(), passwordEncoder.encode(request.password()), request.nickname());
        Member saved = memberRepository.saveAndFlush(member);
        return new MemberResponse(saved.getMemberId(), saved.getEmail(), saved.getNickname());
    }
}
