package com.umc.movie.controller;

import com.umc.movie.dto.*;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;

    /** 공개 회원 평점 목록을 조회한다. */
    @GetMapping("/members/{memberId}/ratings")
    public ApiResponse<List<RatingResponse>> list(@PathVariable Long memberId) {
        return ApiResponse.ok("회원 평점을 조회했습니다.", ratingService.getRatingsByMember(memberId));
    }

    /** URL이나 바디가 아닌 토큰의 회원 ID로 평점을 등록한다. */
    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<RatingResponse>> create(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
                                                             @Valid @RequestBody CreateRatingRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("평점을 등록했습니다.", ratingService.create(memberId, request)));
    }

    /** 인증된 회원의 평점을 수정한다. */
    @PatchMapping("/ratings/{ratingId}")
    public ApiResponse<RatingResponse> update(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
                                              @PathVariable Long ratingId, @Valid @RequestBody UpdateRatingRequest request) {
        return ApiResponse.ok("평점을 수정했습니다.", ratingService.update(memberId, ratingId, request));
    }

    /** 삭제도 공통 응답 봉투를 유지하도록 200과 null을 반환한다. */
    @DeleteMapping("/ratings/{ratingId}")
    public ApiResponse<Void> delete(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId, @PathVariable Long ratingId) {
        ratingService.delete(memberId, ratingId);
        return ApiResponse.ok("평점을 삭제했습니다.", null);
    }
}
