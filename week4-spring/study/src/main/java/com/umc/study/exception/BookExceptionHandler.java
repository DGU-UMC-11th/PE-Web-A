package com.umc.study.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import com.umc.study.controller.BookController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(assignableTypes = BookController.class)
public class BookExceptionHandler {
    @ExceptionHandler(CategoryNotFoundException.class)
    public ProblemDetail categoryNotFound(CategoryNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail invalidRequest(MethodArgumentNotValidException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "요청 값을 확인해 주세요.");
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
            errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail invalidJson() {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "JSON 형식과 필드 타입을 확인해 주세요.");
    }
}
