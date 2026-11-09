package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.exception.ConflictException;
import com.umc.movie.exception.InvalidPasswordException;
import com.umc.movie.exception.IntegrityViolationClassifier;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import com.umc.movie.exception.ResourceNotFoundException;
import com.umc.movie.exception.RatingOwnershipException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage()).distinct().sorted()
                .collect(java.util.stream.Collectors.joining(" "));
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", message));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> invalidFormat(Exception ex) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4002", "JSON 형식과 필드 타입을 확인해주세요."));
    }
    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiResponse<Void>> passwordPolicy(InvalidPasswordException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", ex.getMessage()));
    }
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> conflict(ConflictException ex) {
        return ResponseEntity.status(409).body(ApiResponse.failure(ex.getCode(), ex.getMessage()));
    }
    // 사전 중복 확인을 동시에 통과해도 DB UNIQUE 제약이 마지막으로 저장을 막습니다.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> integrity(DataIntegrityViolationException ex) {
        if (IntegrityViolationClassifier.isUniqueViolation(ex)) {
            return ResponseEntity.status(409).body(ApiResponse.failure("COMMON4091", "이미 존재하는 데이터입니다."));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4003", "데이터 형식 또는 참조 관계를 확인해주세요."));
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> notFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(ApiResponse.failure("COMMON404", ex.getMessage()));
    }
    @ExceptionHandler(RatingOwnershipException.class)
    public ResponseEntity<ApiResponse<Void>> forbidden(RatingOwnershipException ex) {
        return ResponseEntity.status(403).body(ApiResponse.failure("COMMON403", ex.getMessage()));
    }
}
