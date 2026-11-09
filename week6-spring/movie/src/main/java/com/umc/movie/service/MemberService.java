package com.umc.movie.service;

import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.ConflictException;
import com.umc.movie.exception.InvalidPasswordException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private static final Pattern PASSWORD_POLICY = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$");

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberResponse signUp(SignUpRequest request) {
        validatePassword(request.password());
        if (memberRepository.existsByEmail(request.email())) {
            throw new ConflictException("MEMBER4091", "이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByNickname(request.nickname())) {
            throw new ConflictException("MEMBER4092", "이미 사용 중인 닉네임입니다.");
        }
        Member member = new Member(request.email(), passwordEncoder.encode(request.password()), request.nickname());
        Member saved = memberRepository.saveAndFlush(member);
        return new MemberResponse(saved.getMemberId(), saved.getEmail(), saved.getNickname());
    }

    private void validatePassword(String password) {
        if (password == null || !PASSWORD_POLICY.matcher(password).matches()) {
            throw new InvalidPasswordException("비밀번호는 대문자/소문자/숫자/특수문자(!@#$%^&*)를 포함한 8자 이상이어야 합니다.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new InvalidPasswordException("비밀번호는 UTF-8 기준 72바이트 이하로 입력해주세요.");
        }
    }

    @Transactional(readOnly = true)
    public NicknameCheckResponse checkNickname(String nickname) {
        boolean exists = memberRepository.existsByNickname(nickname);
        return new NicknameCheckResponse(!exists);
    }

    @Transactional(readOnly = true)
    public EmailCheckResponse checkEmail(String email) {
        boolean exists = memberRepository.existsByEmail(email);
        return new EmailCheckResponse(!exists);
    }
}
