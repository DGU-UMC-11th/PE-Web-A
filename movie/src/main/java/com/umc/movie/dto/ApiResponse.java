// src/main/java/com/umc/movie/dto/ApiResponse.java
package com.umc.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApiResponse<T>(
        @JsonProperty("isSuccess") boolean isSuccess,
        String code,
        String message,
        T result
) {
    public static <T> ApiResponse<T> created(String message, T result) {
        return new ApiResponse<>(true, "COMMON201", message, result);
    }

    public static <T> ApiResponse<T> ok(String message, T result) {
        return new ApiResponse<>(true, "COMMON200", message, result);
    }

    public static <T> ApiResponse<T> failure(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }
}
