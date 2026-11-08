
package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.exception.DuplicateMemberException;

import java.util.Locale;

import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. DTO 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("입력값이 올바르지 않습니다.");

        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("COMMON4001", message));
    }

    // 2. 경로 변수 등의 검증 실패 (5주차 기능 유지)
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodValidation(
            HandlerMethodValidationException exception
    ) {
        String message = exception.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .filter(value -> value != null)
                .findFirst()
                .orElse("요청 값이 올바르지 않습니다.");

        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("COMMON4001", message));
    }

    // 3. @Validated 기반 제약 조건 검증 실패
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException exception
    ) {
        String message = exception.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("요청 값이 올바르지 않습니다.");

        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("COMMON4001", message));
    }

    // 4. 요청 값 타입 오류 (5주차 기능 유지)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidType(
            MethodArgumentTypeMismatchException exception
    ) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure(
                        "COMMON4001",
                        "요청 값의 형식이 올바르지 않습니다."
                ));
    }

    // 5. DB 제약 조건 위반
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
            DataIntegrityViolationException exception
    ) {
        // SQL/입력값 전체를 노출하지 않고, 알려진 회원 UNIQUE 제약만 변환한다.
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause instanceof org.hibernate.exception.ConstraintViolationException violation) {
                String constraint = violation.getConstraintName();
                if (constraint == null) {
                    continue;
                }
                constraint = constraint.toLowerCase(Locale.ROOT);
                // H2는 PUBLIC.UK_MEMBER_EMAIL_INDEX_... 형태로 반환할 수 있다.
                if (constraint.matches("(?:.*\\.)?uk_member_email(?:_index_[a-z0-9]+)?")) {
                    return duplicateResponse(DuplicateMemberException.Field.EMAIL);
                }
                if (constraint.matches("(?:.*\\.)?uk_member_nickname(?:_index_[a-z0-9]+)?")) {
                    return duplicateResponse(DuplicateMemberException.Field.NICKNAME);
                }
            }
        }
        return ResponseEntity.status(409)
                .body(ApiResponse.failure(
                        "COMMON4091",
                        "이미 존재하거나 제약 조건을 위반한 데이터입니다."
                ));
    }

    @ExceptionHandler(DuplicateMemberException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateMember(DuplicateMemberException exception) {
        return duplicateResponse(exception.field());
    }

    private ResponseEntity<ApiResponse<Void>> duplicateResponse(DuplicateMemberException.Field field) {
        return ResponseEntity.status(409)
                .body(ApiResponse.failure(field.code(), field.message()));
    }

    // 6. Service 중복 검사 오류
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
            IllegalArgumentException exception
    ) {
        return ResponseEntity.status(409)
                .body(ApiResponse.failure(
                        "COMMON4092",
                        exception.getMessage()
                ));
    }

    // 7. HTTP 상태 지정 예외
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatus(
            ResponseStatusException exception
    ) {
        int status = exception.getStatusCode().value();

        return ResponseEntity.status(status)
                .body(ApiResponse.failure(
                        "COMMON" + status,
                        exception.getReason()
                ));
    }
}
