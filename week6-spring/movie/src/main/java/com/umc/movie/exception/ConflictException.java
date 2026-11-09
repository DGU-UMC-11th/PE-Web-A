package com.umc.movie.exception;

public class ConflictException extends RuntimeException {
    private final String code;
    /** 중복 저장 오류의 코드와 메시지를 보관하며 원인이 있으면 함께 유지한다. */
    public ConflictException(String code, String message) {
        super(message);
        this.code = code;
    }
    /** 중복 저장 오류의 코드와 메시지를 보관하며 원인이 있으면 함께 유지한다. */
    public ConflictException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    /** 클라이언트에 전달할 도메인 오류 코드를 반환한다. */
    public String getCode() { return code; }
}
