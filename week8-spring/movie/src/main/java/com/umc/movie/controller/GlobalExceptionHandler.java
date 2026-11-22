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
import com.umc.movie.exception.ApiException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    /** DTO 검증 실패 메시지를 모아 공통 400 응답으로 반환한다. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage()).distinct().sorted()
                .collect(java.util.stream.Collectors.joining(" "));
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", message));
    }
    /** JSON 또는 경로 변수 타입 오류를 공통 400 응답으로 변환한다. */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> invalidFormat(Exception ex) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4002", "JSON 형식과 필드 타입을 확인해주세요."));
    }
    /** 서비스의 비밀번호 정책 위반을 기존 검증 오류 코드로 변환한다. */
    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiResponse<Void>> passwordPolicy(InvalidPasswordException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", ex.getMessage()));
    }
    /** 도메인 중복 오류 코드와 메시지를 409 응답에 담는다. */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> conflict(ConflictException ex) {
        return ResponseEntity.status(409).body(ApiResponse.failure(ex.getCode(), ex.getMessage()));
    }
    // 사전 중복 확인을 동시에 통과해도 DB UNIQUE 제약이 마지막으로 저장을 막습니다.
    /** UNIQUE 위반은 409로, 그 밖의 무결성 위반은 별도 400 코드로 반환한다. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> integrity(DataIntegrityViolationException ex) {
        if (IntegrityViolationClassifier.isDuplicateConstraint(ex, "uk_favorite_member_movie")) {
            return ResponseEntity.status(409).body(ApiResponse.failure("FAVORITE409_1", "이미 이 영화를 즐겨찾기하셨습니다."));
        }
        if (IntegrityViolationClassifier.isDuplicateConstraint(ex, "uk_rating_member_movie")) {
            return ResponseEntity.status(409).body(ApiResponse.failure("RATING409_1", "이미 이 영화에 평점을 남기셨습니다."));
        }
        if (IntegrityViolationClassifier.isUniqueViolation(ex)) {
            return ResponseEntity.status(409).body(ApiResponse.failure("COMMON4091", "이미 존재하는 데이터입니다."));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4003", "데이터 형식 또는 참조 관계를 확인해주세요."));
    }
    /** 인증과 업무 규칙 오류를 지정된 상태 코드와 공통 봉투로 반환한다. */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> api(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.failure(ex.getCode(), ex.getMessage()));
    }
}
