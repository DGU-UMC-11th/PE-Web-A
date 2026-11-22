package com.umc.movie.controller;

import com.umc.movie.annotation.LoginMember;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.entity.Favorite;
import com.umc.movie.repository.FavoriteRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@Validated
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteRepository favorites;

    public record FavoriteRequest(@NotNull @Positive Long movieId) {}
    public record FavoriteStatus(long movieId, boolean favorited) {}

    @GetMapping
    public ApiResponse<List<Long>> list(@LoginMember Long memberId) {
        return ApiResponse.ok("즐겨찾기를 조회했습니다.", favorites.findByMemberIdOrderByFavoriteIdDesc(memberId)
                .stream().map(Favorite::getMovieId).toList());
    }

    @GetMapping("/{movieId}")
    public ApiResponse<FavoriteStatus> status(@LoginMember Long memberId, @PathVariable @Positive Long movieId) {
        return ApiResponse.ok("즐겨찾기를 조회했습니다.",
                new FavoriteStatus(movieId, favorites.existsByMemberIdAndMovieId(memberId, movieId)));
    }

    @PostMapping
    public ApiResponse<FavoriteStatus> add(@LoginMember Long memberId, @Valid @RequestBody FavoriteRequest body) {
        try {
            if (!favorites.existsByMemberIdAndMovieId(memberId, body.movieId())) {
                favorites.saveAndFlush(new Favorite(memberId, body.movieId()));
            }
        } catch (DataIntegrityViolationException exception) {
            if (!favorites.existsByMemberIdAndMovieId(memberId, body.movieId())) {
                throw exception;
            }
        }
        return ApiResponse.ok("즐겨찾기를 추가했습니다.", new FavoriteStatus(body.movieId(), true));
    }

    @DeleteMapping("/{movieId}")
    @Transactional
    public ResponseEntity<Void> remove(@LoginMember Long memberId, @PathVariable @Positive Long movieId) {
        favorites.deleteByMemberIdAndMovieId(memberId, movieId);
        return ResponseEntity.noContent().build();
    }
}
