
package com.umc.movie.service;

import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.DuplicateMemberException;
import com.umc.movie.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.exception.ApiException;
import org.springframework.http.HttpStatus;
import com.umc.movie.dto.MemberUpdateRequest;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 5주차: 닉네임 중복 검사
    @Transactional(readOnly = true)
    public NicknameCheckResponse checkNickname(String nickname) {
        boolean exists = memberRepository.existsByNickname(nickname);
        return new NicknameCheckResponse(!exists);
    }

    // 5주차: 이메일 중복 검사
    @Transactional(readOnly = true)
    public EmailCheckResponse checkEmail(String email) {
        boolean exists = memberRepository.existsByEmail(email);
        return new EmailCheckResponse(!exists);
    }

    // 6주차: 회원가입
    @Transactional
    public MemberResponse signUp(SignUpRequest request) {

        // 1. 이메일 중복 검사
        if (memberRepository.existsByEmail(request.email())) {
            throw new DuplicateMemberException(DuplicateMemberException.Field.EMAIL);
        }

        // 2. 닉네임 중복 검사
        if (memberRepository.existsByNickname(request.nickname())) {
            throw new DuplicateMemberException(DuplicateMemberException.Field.NICKNAME);
        }

        // 3. 회원 객체 생성 및 비밀번호 암호화
        Member member = Member.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .build();

        // 4. 데이터베이스에 저장
        Member savedMember = memberRepository.save(member);

        // 5. 회원가입 결과 반환
        return new MemberResponse(
                savedMember.getMemberId(),
                savedMember.getEmail(),
                savedMember.getNickname()
        );
    }

    public MemberInfoResponse getMyInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "MEMBER404_1",
                        "해당 회원을 찾을 수 없습니다."
                ));

        return MemberInfoResponse.from(member);
    }

    public MemberInfoResponse updateMyInfo(Long memberId, MemberUpdateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1",
                        "해당 회원을 찾을 수 없습니다."));

        // 나를 제외한 다른 회원이 그 닉네임을 쓰고 있다면 막습니다.
        // DB에도 UNIQUE 제약이 걸려 있지만 제약 위반 예외 대신 우리가 정한 응답을 주기 위해 먼저 확인합니다.
        if (memberRepository.existsByNicknameAndMemberIdNot(request.nickname(), memberId)) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER409_1",
                    "이미 사용 중인 닉네임입니다.");
        }

        member.updateNickname(request.nickname());
        memberRepository.save(member);

        return MemberInfoResponse.from(member);
    }
}
