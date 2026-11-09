package com.umc.movie.exception;

public class RatingOwnershipException extends RuntimeException {
    /** 다른 회원의 평점 변경 요청임을 전달한다. */
    public RatingOwnershipException(String message) {
        super(message);
    }
}
