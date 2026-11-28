
package com.umc.movie.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.MemberService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.umc.movie.dto.MemberUpdateRequest;
import com.umc.movie.annotation.LoginMember;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/members")
@Tag(name = "회원", description = "회원가입과 내 정보 API")
public class MemberController {

    private final MemberService memberService;

    // 5주차: 닉네임 중복 검사
    @GetMapping("/nickname/{nickname}")
    public NicknameCheckResponse checkNickname(
            @PathVariable
            @Size(min = 2, max = 12, message = "닉네임은 2~12자여야 합니다.")
            String nickname
    ) {
        return memberService.checkNickname(nickname);
    }

    // 5주차: 이메일 중복 검사
    @GetMapping("/email/{email}")
    public EmailCheckResponse checkEmail(
            @PathVariable
            @Email(message = "올바른 이메일 형식이어야 합니다.")
            String email
    ) {
        return memberService.checkEmail(email);
    }
    @Operation(
            summary = "회원가입",
            description = "이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다."
    )
    // 6주차: 회원가입
    @PostMapping
    public ResponseEntity<com.umc.movie.dto.ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        MemberResponse response = memberService.signUp(request);

        return ResponseEntity.status(201)
                .body(com.umc.movie.dto.ApiResponse.created(
                        "회원가입에 성공했습니다.",
                        response
                ));
    }

    // 7주차: 내 정보 조회
    @Operation(summary = "내 정보 조회",
            description = "로그인한 회원의 프로필을 조회합니다. Bearer JWT가 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "내 정보 조회 성공 (COMMON200)",
                    useReturnTypeSchema = true),
            @ApiResponse(responseCode = "401", description = "토큰 누락 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 회원을 찾을 수 없음 (MEMBER404_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<MemberInfoResponse>> getMyInfo(
            @Parameter(hidden = true) @LoginMember Long memberId
    ) {
        MemberInfoResponse response = memberService.getMyInfo(memberId);

        return ResponseEntity.ok(
                com.umc.movie.dto.ApiResponse.ok("회원 정보를 조회했습니다.", response)
        );
    }

    @Operation(summary = "내 정보 수정",
            description = "로그인한 회원의 닉네임을 변경합니다. Bearer JWT가 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "내 정보 수정 성공 (COMMON200)",
                    useReturnTypeSchema = true),
            @ApiResponse(responseCode = "400", description = "요청 값 또는 형식 오류 (COMMON4001)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "토큰 누락 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 회원을 찾을 수 없음 (MEMBER404_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "409",
                    description = "닉네임 중복 (MEMBER409_1, MEMBER4092) 또는 기타 DB 제약 조건 위반 (COMMON4091)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/me")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<MemberInfoResponse>> updateMyInfo(
            @Parameter(hidden = true) @LoginMember Long memberId,
            @RequestBody @Valid MemberUpdateRequest request
    ) {
        MemberInfoResponse response = memberService.updateMyInfo(memberId, request);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok("회원 정보를 수정했습니다.", response));
    }

}
