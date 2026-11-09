package com.umc.movie.dto;

import jakarta.validation.constraints.*;

/** 별점과 후기를 교체한다. 후기를 생략하거나 null로 보내면 기존 후기를 지운다. */
public record UpdateRatingRequest(
        @NotNull(message = "별점을 입력해주세요.")
        @Min(value = 1, message = "별점은 1점 이상이어야 합니다.")
        @Max(value = 5, message = "별점은 5점 이하여야 합니다.") Integer score,
        @Size(max = 500, message = "후기는 500자 이하로 입력해주세요.") String comment
) {}
