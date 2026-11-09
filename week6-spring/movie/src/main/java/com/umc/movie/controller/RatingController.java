package com.umc.movie.controller;

import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umc.movie.service.RatingService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class RatingController {

    private final RatingService ratingService;

    /** 회원의 평점 목록을 공통 성공 응답에 담는다. */
    @GetMapping("/{memberId}/ratings")
    public ApiResponse<List<RatingResponse>> getMemberRatings(@PathVariable Long memberId) {
        return ApiResponse.ok("회원 평점을 조회했습니다.", ratingService.getRatingsByMember(memberId));
    }

    /** 평점 등록 요청을 서비스에 전달하고 생성된 ID를 201 응답에 담는다. */
    @PostMapping("/{memberId}/ratings")
    public ResponseEntity<ApiResponse<Long>> create(@PathVariable Long memberId,
                                                   @Valid @RequestBody CreateRatingRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("평점 등록에 성공했습니다.", ratingService.create(memberId, request)));
    }

    /** 평점 수정 요청을 서비스에 전달하고 200 공통 응답을 반환한다. */
    @PatchMapping("/{memberId}/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long memberId, @PathVariable Long ratingId,
                                                   @Valid @RequestBody UpdateRatingRequest request) {
        ratingService.update(ratingId, memberId, request);
        return ResponseEntity.ok(ApiResponse.ok("평점 수정에 성공했습니다.", null));
    }

    /** 평점 삭제 요청을 서비스에 전달하고 본문 없는 204 응답을 반환한다. */
    @DeleteMapping("/{memberId}/ratings/{ratingId}")
    public ResponseEntity<Void> delete(@PathVariable Long memberId, @PathVariable Long ratingId) {
        ratingService.delete(ratingId, memberId);
        return ResponseEntity.noContent().build();
    }
}
