package com.umc.movie.service;

import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.dto.MemberUpdateRequest;
import com.umc.movie.exception.ApiException;
import org.springframework.http.HttpStatus;
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

    /** 비밀번호 정책과 중복을 확인한 뒤 해시된 비밀번호로 회원을 저장한다. */
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

    /** 비밀번호 문자 구성과 bcrypt의 UTF-8 72바이트 입력 한도를 검증한다. */
    private void validatePassword(String password) {
        if (password == null || !PASSWORD_POLICY.matcher(password).matches()) {
            throw new InvalidPasswordException("비밀번호는 대문자/소문자/숫자/특수문자(!@#$%^&*)를 포함한 8자 이상이어야 합니다.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new InvalidPasswordException("비밀번호는 UTF-8 기준 72바이트 이하로 입력해주세요.");
        }
    }

    /** 닉네임의 사용 가능 여부를 반환한다. */
    @Transactional(readOnly = true)
    public NicknameCheckResponse checkNickname(String nickname) {
        boolean exists = memberRepository.existsByNickname(nickname);
        return new NicknameCheckResponse(!exists);
    }

    /** 이메일의 사용 가능 여부를 반환한다. */
    @Transactional(readOnly = true)
    public EmailCheckResponse checkEmail(String email) {
        boolean exists = memberRepository.existsByEmail(email);
        return new EmailCheckResponse(!exists);
    }

    /** 토큰으로 식별된 회원의 공개 프로필을 조회한다. */
    @Transactional(readOnly = true)
    public MemberInfoResponse getMe(Long memberId) {
        return MemberInfoResponse.from(findMember(memberId));
    }

    /** 다른 회원과 닉네임이 중복되지 않는지 검사하고 최신 프로필을 반환한다. */
    @Transactional
    public MemberInfoResponse updateMe(Long memberId, MemberUpdateRequest request) {
        Member member = findMember(memberId);
        if (!member.getNickname().equals(request.nickname()) && memberRepository.existsByNickname(request.nickname())) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER409_1", "이미 사용 중인 닉네임입니다.");
        }
        member.updateNickname(request.nickname());
        memberRepository.flush();
        return MemberInfoResponse.from(member);
    }

    /** 토큰에 담긴 회원이 삭제된 경우도 처리한다. */
    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1", "해당 회원을 찾을 수 없습니다."));
    }
}
