package com.umc.study.repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RentalRepository {
    private final JdbcTemplate jdbcTemplate;

    /** 입력값을 바인딩하고 DB에서 생성한 대여 ID를 반환한다. */
    public long save(long userId, long bookId) {
        String sql = """
            INSERT INTO rental (user_id, book_id, rented_at, due_at, returned_at)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NULL)
            """;
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, userId);
            statement.setLong(2, bookId);
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) throw new IllegalStateException("대여 ID 생성에 실패했습니다.");
        return key.longValue();
    }

    public Map<String, Object> findById(long rentalId) {
        return jdbcTemplate.queryForMap("SELECT * FROM rental WHERE rental_id = ?", rentalId);
    }
}
