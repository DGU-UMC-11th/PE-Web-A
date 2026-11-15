package com.umc.movie.controller;

import com.umc.movie.auth.LoginMember;
import com.umc.movie.dto.*;
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

    @GetMapping("/members/{memberId}/ratings")
    public List<RatingResponse> getMemberRatings(@PathVariable Long memberId) {
        return ratingService.getRatingsByMember(memberId);
    }

    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<RatingResponse>> create(@LoginMember Long memberId,
                                                             @Valid @RequestBody CreateRatingRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("평점을 등록했습니다.", ratingService.create(memberId, request)));
    }

    @PatchMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> update(@LoginMember Long memberId, @PathVariable Long ratingId,
                                                             @Valid @RequestBody UpdateRatingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("평점을 수정했습니다.", ratingService.update(memberId, ratingId, request)));
    }

    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> delete(@LoginMember Long memberId, @PathVariable Long ratingId) {
        ratingService.delete(memberId, ratingId);
        return ResponseEntity.ok(ApiResponse.ok("평점을 삭제했습니다.", null));
    }
}
