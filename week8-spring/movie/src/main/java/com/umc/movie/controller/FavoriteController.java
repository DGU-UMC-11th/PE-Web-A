package com.umc.movie.controller;

import com.umc.movie.dto.*;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    /** 토큰의 회원 ID와 바디의 영화 ID로 즐겨찾기를 등록한다. */
    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> create(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
                                                                @Valid @RequestBody CreateFavoriteRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("즐겨찾기를 등록했습니다.", favoriteService.create(memberId, request)));
    }

    /** 내 즐겨찾기 목록을 조회한다. */
    @GetMapping
    public ApiResponse<List<FavoriteResponse>> list(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId) {
        return ApiResponse.ok("즐겨찾기 목록을 조회했습니다.", favoriteService.getMyFavorites(memberId));
    }

    /** 영화 상세 화면에서 사용할 북마크 여부를 반환한다. */
    @GetMapping("/{movieId}")
    public ApiResponse<FavoriteStatusResponse> status(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
                                                      @PathVariable Long movieId) {
        return ApiResponse.ok("즐겨찾기 여부를 조회했습니다.", favoriteService.getStatus(memberId, movieId));
    }

    /** 즐겨찾기 해제는 200과 result:null을 반환한다. */
    @DeleteMapping("/{movieId}")
    public ApiResponse<Void> delete(@RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId, @PathVariable Long movieId) {
        favoriteService.delete(memberId, movieId);
        return ApiResponse.ok("즐겨찾기를 해제했습니다.", null);
    }
}
