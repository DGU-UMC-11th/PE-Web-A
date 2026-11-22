package com.umc.movie.dto;

public record ApiResponse<T>(boolean isSuccess, String code, String message, T result) {
    /** 생성 성공 코드와 결과를 공통 응답에 담는다. */
    public static <T> ApiResponse<T> created(String message, T result) {
        return new ApiResponse<>(true, "COMMON201", message, result);
    }
    /** 조회 또는 수정 성공 코드와 결과를 공통 응답에 담는다. */
    public static <T> ApiResponse<T> ok(String message, T result) {
        return new ApiResponse<>(true, "COMMON200", message, result);
    }
    /** 오류 코드와 메시지를 담고 결과는 null로 반환한다. */
    public static ApiResponse<Void> failure(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }
}
