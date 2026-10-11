package com.umc.study.service;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.umc.study.repository.RentalRepository;

@Service
@RequiredArgsConstructor
public class RentalService {
    private final RentalRepository rentalRepository;

    /** 필수 ID를 검증하고 생성된 대여 기록을 JSON용 Map으로 반환한다. */
    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        long userId = positiveId(body.get("userId"), "userId");
        long bookId = positiveId(body.get("bookId"), "bookId");
        try {
            long rentalId = rentalRepository.save(userId, bookId);
            return rentalRepository.findById(rentalId);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 또는 도서 ID를 확인해 주세요.", exception);
        }
    }

    /** 소수, 문자열, 누락값을 거부하고 양수 정수만 허용한다. */
    private long positiveId(Object value, String field) {
        if (!(value instanceof Integer || value instanceof Long) || ((Number) value).longValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + "는 양수 정수여야 합니다.");
        }
        return ((Number) value).longValue();
    }
}
