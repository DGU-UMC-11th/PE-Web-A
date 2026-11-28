
package com.umc.movie.controller;

import com.umc.movie.config.SwaggerConfig;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "즐겨찾기", description = "로그인한 회원의 영화 즐겨찾기 API")
@SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
@RestController
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(
            summary = "즐겨찾기 등록",
            description = "토큰의 주인인 회원이 TMDB 영화 ID 하나를 즐겨찾기에 추가합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "즐겨찾기 등록 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": true,
                                              "code": "COMMON201",
                                              "message": "즐겨찾기를 등록했습니다.",
                                              "result": {
                                                "favoriteId": 1,
                                                "movieId": 550,
                                                "createdAt": "2026-09-13T21:00:00"
                                              }
                                            }
                                            """)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "요청 값이 올바르지 않습니다 (COMMON4001)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": false,
                                              "code": "AUTH401_2",
                                              "message": "로그인이 필요한 요청입니다.",
                                              "result": null
                                            }
                                            """)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "해당 회원을 찾을 수 없습니다 (MEMBER404_1)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "이미 즐겨찾기한 영화 (FAVORITE409_1)",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": false,
                                              "code": "FAVORITE409_1",
                                              "message": "이미 이 영화를 즐겨찾기하셨습니다.",
                                              "result": null
                                            }
                                            """)
                            )
                    )
            }
    )
    @PostMapping("/favorites")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteResponse>> create(
            @Parameter(hidden = true)
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @RequestBody @Valid CreateFavoriteRequest request
    ) {
        FavoriteResponse response = favoriteService.create(memberId, request);
        return ResponseEntity.status(201)
                .body(com.umc.movie.dto.ApiResponse.created(
                        "즐겨찾기를 등록했습니다.", response));
    }

    @Operation(
            summary = "내 즐겨찾기 목록 조회",
            description = "로그인한 회원의 즐겨찾기 목록을 조회합니다. Bearer JWT가 필요합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "내 즐겨찾기 목록을 조회했습니다.",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": true,
                                              "code": "COMMON200",
                                              "message": "내 즐겨찾기 목록을 조회했습니다.",
                                              "result": [
                                                {
                                                  "favoriteId": 1,
                                                  "movieId": 550,
                                                  "createdAt": "2026-09-06T21:00:00"
                                                }
                                              ]
                                            }
                                            """)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    )
            }
    )
    @GetMapping("/favorites")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<List<FavoriteResponse>>> getMyFavorites(
            @Parameter(hidden = true)
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId
    ) {
        List<FavoriteResponse> response = favoriteService.getMyFavorites(memberId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok(
                "내 즐겨찾기 목록을 조회했습니다.", response));
    }

    @Operation(
            summary = "즐겨찾기 여부 조회",
            description = "로그인한 회원이 해당 영화를 즐겨찾기했는지 확인합니다. Bearer JWT가 필요합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "즐겨찾기 여부를 조회했습니다.",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": true,
                                              "code": "COMMON200",
                                              "message": "즐겨찾기 여부를 조회했습니다.",
                                              "result": {
                                                "isFavorite": true
                                              }
                                            }
                                            """)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "요청 값이 올바르지 않습니다 (COMMON4001)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    )
            }
    )
    @GetMapping("/favorites/{movieId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteStatusResponse>> getStatus(
            @Parameter(hidden = true)
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @Parameter(example = "550")
            @PathVariable @Positive Long movieId
    ) {
        FavoriteStatusResponse response = favoriteService.getStatus(memberId, movieId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok(
                "즐겨찾기 여부를 조회했습니다.", response));
    }

    @Operation(
            summary = "즐겨찾기 해제",
            description = "로그인한 회원의 즐겨찾기에서 해당 영화를 제거합니다. Bearer JWT가 필요합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "즐겨찾기를 해제했습니다.",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(value = """
                                            {
                                              "isSuccess": true,
                                              "code": "COMMON200",
                                              "message": "즐겨찾기를 해제했습니다.",
                                              "result": null
                                            }
                                            """)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "요청 값이 올바르지 않습니다 (COMMON4001)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 필요 (AUTH401_2), 유효하지 않은 토큰 (AUTH401_3), 만료된 토큰 (AUTH401_4)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "즐겨찾기한 영화를 찾을 수 없습니다 (FAVORITE404_1)",
                            content = @Content(schema = @Schema(
                                    implementation = com.umc.movie.dto.ApiResponse.class))
                    )
            }
    )
    @DeleteMapping("/favorites/{movieId}")
    public ResponseEntity<com.umc.movie.dto.ApiResponse<Void>> delete(
            @Parameter(hidden = true)
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @Parameter(example = "550")
            @PathVariable @Positive Long movieId
    ) {
        favoriteService.delete(memberId, movieId);
        return ResponseEntity.ok(com.umc.movie.dto.ApiResponse.ok(
                "즐겨찾기를 해제했습니다.", null));
    }
}
