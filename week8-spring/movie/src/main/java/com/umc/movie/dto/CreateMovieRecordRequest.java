package com.umc.movie.dto;
import jakarta.validation.constraints.*;

public record CreateMovieRecordRequest(
        @NotNull @Positive Long movieId,
        @NotNull @Min(1) @Max(5) Integer score,
        @Size(max = 500) String comment,
        @NotNull(message = "즐겨찾기 추가 여부는 필수입니다.") Boolean addToFavorites
) {}
