
package com.umc.movie.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.RatingPageResponse;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.RatingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.umc.movie.annotation.LoginMember;

@Tag(name = "평점", description = "영화 평점 등록, 수정, 삭제 및 회원별 조회 API")
@RestController
@Validated
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // 5주차: 회원별 평점 조회 및 페이지네이션 (기존 기능 유지)
    @Operation(summary = "회원별 평점 조회",
            description = "회원이 작성한 평점을 최신 등록순으로 페이지 단위 조회합니다. JWT 없이 호출할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원별 평점 목록 조회 성공",
                    useReturnTypeSchema = true),
            @ApiResponse(responseCode = "400", description = "요청 값 또는 형식 오류 (COMMON4001)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 회원을 찾을 수 없음 (MEMBER404_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @GetMapping("/members/{memberId}/ratings")
    public RatingPageResponse getMemberRatings(
            @PathVariable @Min(1) Long memberId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        return ratingService.getRatingsByMember(memberId, page, size);
    }

    // 7주차: JWT 기반 평점 등록
    @Operation(summary = "평점 등록",
            description = "로그인한 회원의 영화 별점과 후기를 등록합니다. Bearer JWT가 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "평점 등록 성공 (COMMON201)",
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
            @ApiResponse(responseCode = "409", description = "이미 등록한 평점 (RATING409_1) 또는 DB 제약 조건 위반 (COMMON4091)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/ratings")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<RatingResponse>> create(
            @Parameter(hidden = true) @LoginMember Long memberId,
            @Valid @RequestBody CreateRatingRequest request
    ) {
        RatingResponse response = ratingService.create(memberId, request);

        return ResponseEntity.status(201)
                .body(com.umc.movie.dto.ApiResponse.created("평점 등록에 성공했습니다.", response));
    }

    // 7주차: JWT 기반 평점 수정
    @Operation(summary = "평점 수정",
            description = "로그인한 회원이 자신이 작성한 평점의 별점과 후기를 수정합니다. Bearer JWT가 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "평점 수정 성공 (COMMON200)",
                    useReturnTypeSchema = true),
            @ApiResponse(responseCode = "400", description = "요청 값 또는 형식 오류 (COMMON4001)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "토큰 누락 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "다른 회원이 작성한 평점 (RATING403_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 평점을 찾을 수 없음 (RATING404_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/ratings/{ratingId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<RatingResponse>> update(
            @Parameter(hidden = true) @LoginMember Long memberId,
            @PathVariable Long ratingId,
            @Valid @RequestBody UpdateRatingRequest request
    ) {
        RatingResponse response =
                ratingService.update(memberId, ratingId, request);

        return ResponseEntity.ok(
                com.umc.movie.dto.ApiResponse.ok("평점 수정에 성공했습니다.", response)
        );
    }

    // 7주차: JWT 기반 평점 삭제
    @Operation(summary = "평점 삭제",
            description = "로그인한 회원이 자신이 작성한 평점을 삭제합니다. Bearer JWT가 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "평점 삭제 성공 (COMMON200)",
                    useReturnTypeSchema = true),
            @ApiResponse(responseCode = "400", description = "요청 값 또는 형식 오류 (COMMON4001)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "토큰 누락 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "다른 회원이 작성한 평점 (RATING403_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 평점을 찾을 수 없음 (RATING404_1)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<Void>> delete(
            @Parameter(hidden = true) @LoginMember Long memberId,
            @PathVariable Long ratingId
    ) {
        ratingService.delete(memberId, ratingId);

        return ResponseEntity.ok(
                com.umc.movie.dto.ApiResponse.ok("평점 삭제에 성공했습니다.", null)
        );
    }
}
