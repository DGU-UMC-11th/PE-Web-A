package com.umc.movie.controller;

import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.MovieRecordResponse;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.MovieRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "영화 기록")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
public class MovieRecordController {

    private final MovieRecordService movieRecordService;

    @Operation(summary = "영화 기록 저장", responses = {
            @ApiResponse(responseCode = "201", description = "영화 기록을 저장했습니다.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = "{\"isSuccess\":true,\"code\":\"COMMON201\",\"message\":\"영화 기록을 저장했습니다.\",\"result\":{\"rating\":{\"ratingId\":1,\"movieId\":550,\"score\":5,\"comment\":\"다시 보고 싶은 영화입니다.\",\"createdAt\":\"2026-09-06T21:00:00\",\"updatedAt\":\"2026-09-06T21:00:00\"},\"favorite\":{\"favoriteId\":1,\"movieId\":550,\"createdAt\":\"2026-09-06T21:00:00\"}}}"))),
            @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않습니다 (COMMON4001)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 회원을 찾을 수 없습니다 (MEMBER404_1)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "409", description = "평점 중복 (RATING409_1) 또는 즐겨찾기 중복 (FAVORITE409_1)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @PostMapping("/movie-records")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<MovieRecordResponse>> create(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @RequestBody @Valid CreateMovieRecordRequest request
    ) {
        MovieRecordResponse response = movieRecordService.create(memberId, request);
        return ResponseEntity.status(201)
                .body(com.umc.movie.dto.ApiResponse.created("영화 기록을 저장했습니다.", response));
    }
}
