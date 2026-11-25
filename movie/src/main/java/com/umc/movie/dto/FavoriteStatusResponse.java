// src/main/java/com/umc/movie/dto/FavoriteStatusResponse.java
package com.umc.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// boolean 필드 이름이 is로 시작하면 Jackson이 "favorite"으로 내보낼 수 있어 이름을 고정합니다 (ApiResponse와 같은 방식)
public record FavoriteStatusResponse(
        @JsonProperty("isFavorite") boolean isFavorite
) {}
