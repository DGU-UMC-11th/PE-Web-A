package com.umc.movie.controller;

import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.dto.MemberUpdateRequest;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.SignUpRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    /** 닉네임의 사용 가능 여부를 반환한다. */
    @GetMapping("/nickname/{nickname}")
    public ApiResponse<NicknameCheckResponse> checkNickname(@PathVariable String nickname) {
        return ApiResponse.ok("닉네임 사용 가능 여부를 확인했습니다.", memberService.checkNickname(nickname));
    }

    /** 이메일의 사용 가능 여부를 반환한다. */
    @GetMapping("/email/{email}")
    public ApiResponse<EmailCheckResponse> checkEmail(@PathVariable String email) {
        return ApiResponse.ok("이메일 사용 가능 여부를 확인했습니다.", memberService.checkEmail(email));
    }

    /** 검증된 회원가입 요청을 서비스에 전달하고 201 공통 응답을 반환한다. */
    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("회원가입에 성공했습니다.", memberService.signUp(request)));
    }

    /** 인증된 본인의 정보를 조회한다. */
    @GetMapping("/me")
    public ApiResponse<MemberInfoResponse> me(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId) {
        return ApiResponse.ok("내 정보를 조회했습니다.", memberService.getMe(memberId));
    }

    /** 본인의 닉네임을 수정하고 캐시 갱신에 쓸 최신 정보를 반환한다. */
    @PatchMapping("/me")
    public ApiResponse<MemberInfoResponse> updateMe(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
                                                   @Valid @RequestBody MemberUpdateRequest request) {
        return ApiResponse.ok("내 정보를 수정했습니다.", memberService.updateMe(memberId, request));
    }
}
