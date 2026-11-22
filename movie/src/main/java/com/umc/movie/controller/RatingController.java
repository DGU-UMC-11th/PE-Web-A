
package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
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

@RestController
@Validated
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // 5주차: 회원별 평점 조회 및 페이지네이션 (기존 기능 유지)
    @GetMapping("/members/{memberId}/ratings")
    public RatingPageResponse getMemberRatings(
            @PathVariable @Min(1) Long memberId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        return ratingService.getRatingsByMember(memberId, page, size);
    }

    // 7주차: JWT 기반 평점 등록
    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<RatingResponse>> create(
            @LoginMember Long memberId,
            @Valid @RequestBody CreateRatingRequest request
    ) {
        RatingResponse response = ratingService.create(memberId, request);

        return ResponseEntity.status(201)
                .body(ApiResponse.created("평점 등록에 성공했습니다.", response));
    }

    // 7주차: JWT 기반 평점 수정
    @PatchMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> update(
            @LoginMember Long memberId,
            @PathVariable Long ratingId,
            @Valid @RequestBody UpdateRatingRequest request
    ) {
        RatingResponse response =
                ratingService.update(memberId, ratingId, request);

        return ResponseEntity.ok(
                ApiResponse.ok("평점 수정에 성공했습니다.", response)
        );
    }

    // 7주차: JWT 기반 평점 삭제
    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @LoginMember Long memberId,
            @PathVariable Long ratingId
    ) {
        ratingService.delete(memberId, ratingId);

        return ResponseEntity.ok(
                ApiResponse.ok("평점 삭제에 성공했습니다.", null)
        );
    }
}
