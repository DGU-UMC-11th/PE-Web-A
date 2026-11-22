package com.umc.movie.exception;

public class InvalidPasswordException extends RuntimeException {
    /** 비밀번호 정책 위반 이유를 전달한다. */
    public InvalidPasswordException(String message) {
        super(message);
    }
}
