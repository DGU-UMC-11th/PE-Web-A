package com.umc.movie.exception;

public class ResourceNotFoundException extends RuntimeException {
    /** 요청한 회원 또는 평점이 존재하지 않음을 전달한다. */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
