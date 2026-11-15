package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.exception.BusinessException;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .sorted(java.util.Comparator.comparing(org.springframework.validation.FieldError::getField))
                .map(org.springframework.validation.FieldError::getDefaultMessage)
                .findFirst().orElse("입력값을 확인해주세요.");
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", message));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception exception) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", "요청 형식과 값의 타입을 확인해주세요."));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(ApiResponse.failure(exception.getCode(), exception.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleStatus(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(ApiResponse.failure("COMMON" + exception.getStatusCode().value(), exception.getReason()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException exception) {
        String constraint = "";
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException violation && violation.getConstraintName() != null) {
                constraint = violation.getConstraintName();
                break;
            }
        }
        String code = "COMMON4091";
        String message = "데이터 제약 조건을 위반했습니다.";
        if (constraint.contains("uk_member_email")) {
            code = "MEMBER4091";
            message = "이미 사용 중인 이메일입니다.";
        } else if (constraint.contains("uk_member_nickname")) {
            code = "MEMBER4092";
            message = "이미 사용 중인 닉네임입니다.";
        } else if (constraint.contains("uk_rating_member_movie")) {
            code = "RATING4091";
            message = "이미 이 영화에 평점을 남기셨습니다.";
        }
        return ResponseEntity.status(409).body(ApiResponse.failure(code, message));
    }
}
