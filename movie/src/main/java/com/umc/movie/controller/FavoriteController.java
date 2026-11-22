package com.umc.movie.controller;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.FavoriteStatusResponse;
import com.umc.movie.interceptor.AuthInterceptor;
import com.umc.movie.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "즐겨찾기")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(summary = "즐겨찾기 등록", responses = {
            @ApiResponse(responseCode = "201", description = "즐겨찾기를 등록했습니다.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = "{\"isSuccess\":true,\"code\":\"COMMON201\",\"message\":\"즐겨찾기를 등록했습니다.\",\"result\":{\"favoriteId\":1,\"movieId\":550,\"createdAt\":\"2026-09-06T21:00:00\"}}"))),
            @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않습니다 (COMMON4001)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 회원을 찾을 수 없습니다 (MEMBER404_1)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "409", description = "이미 이 영화를 즐겨찾기하셨습니다 (FAVORITE409_1)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @PostMapping("/favorites")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteResponse>> create(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @RequestBody @Valid CreateFavoriteRequest request
    ) {
        FavoriteResponse response = favoriteService.create(memberId, request);
        return ResponseEntity.status(201)
                .body(com.umc.movie.dto.ApiResponse.created("즐겨찾기를 등록했습니다.", response));
    }

    @Operation(summary = "내 즐겨찾기 목록 조회", responses = {
            @ApiResponse(responseCode = "200", description = "내 즐겨찾기 목록을 조회했습니다.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = "{\"isSuccess\":true,\"code\":\"COMMON200\",\"message\":\"내 즐겨찾기 목록을 조회했습니다.\",\"result\":[{\"favoriteId\":1,\"movieId\":550,\"createdAt\":\"2026-09-06T21:00:00\"}]}"))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @GetMapping("/favorites")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<List<FavoriteResponse>>> getMyFavorites(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId
    ) {
        List<FavoriteResponse> response = favoriteService.getMyFavorites(memberId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok("내 즐겨찾기 목록을 조회했습니다.", response));
    }

    @Operation(summary = "즐겨찾기 여부 조회", responses = {
            @ApiResponse(responseCode = "200", description = "즐겨찾기 여부를 조회했습니다.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = "{\"isSuccess\":true,\"code\":\"COMMON200\",\"message\":\"즐겨찾기 여부를 조회했습니다.\",\"result\":{\"isFavorite\":true}}"))),
            @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않습니다 (COMMON4001)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @GetMapping("/favorites/{movieId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteStatusResponse>> getStatus(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @Parameter(example = "550") @PathVariable @Positive Long movieId
    ) {
        FavoriteStatusResponse response = favoriteService.getStatus(memberId, movieId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok("즐겨찾기 여부를 조회했습니다.", response));
    }

    @Operation(summary = "즐겨찾기 해제", responses = {
            @ApiResponse(responseCode = "200", description = "즐겨찾기를 해제했습니다.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = "{\"isSuccess\":true,\"code\":\"COMMON200\",\"message\":\"즐겨찾기를 해제했습니다.\",\"result\":null}"))),
            @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않습니다 (COMMON4001)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "즐겨찾기한 영화를 찾을 수 없습니다 (FAVORITE404_1)", content = @Content(schema = @Schema(implementation = com.umc.movie.dto.ApiResponse.class)))
    })
    @DeleteMapping("/favorites/{movieId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<Void>> delete(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @Parameter(example = "550") @PathVariable @Positive Long movieId
    ) {
        favoriteService.delete(memberId, movieId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok("즐겨찾기를 해제했습니다.", null));
    }
}
