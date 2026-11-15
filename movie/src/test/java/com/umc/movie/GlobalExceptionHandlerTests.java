package com.umc.movie;

import com.umc.movie.controller.GlobalExceptionHandler;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.exception.DuplicateMemberException;
import org.hibernate.dialect.MySQLDialect;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTests {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test void mysql8QualifiedKeyNamesUseTheSameResponseAsPrechecks() {
        for (var field : DuplicateMemberException.Field.values()) {
            String key = "member.uk_member_" + field.name().toLowerCase(java.util.Locale.ROOT);
            SQLException sql = new SQLException("Duplicate entry 'test' for key '" + key + "'", "23000", 1062);
            String extracted = new MySQLDialect().getViolatedConstraintNameExtractor().extractConstraintName(sql);
            assertThat(extracted).isEqualTo(key);
            var dbError = new DataIntegrityViolationException("insert failed",
                    new ConstraintViolationException("duplicate", sql, extracted));
            var response = handler.handleDataIntegrity(dbError);
            assertThat(response.getStatusCode().value()).isEqualTo(409);
            assertThat(response.getBody()).isEqualTo(ApiResponse.failure(field.code(), field.message()));
            assertThat(response).isEqualTo(handler.handleDuplicateMember(new DuplicateMemberException(field)));
        }
    }

    @Test void unrelatedUniqueAndForeignKeyErrorsKeepTheirCommonResponse() {
        for (String key : new String[]{"uk_member_movie", "fk_rating_member", "PRIMARY", null}) {
            var response = handler.handleDataIntegrity(new DataIntegrityViolationException("private sql",
                    new ConstraintViolationException("private value", new SQLException(), key)));
            assertThat(response.getStatusCode().value()).isEqualTo(409);
            assertThat(response.getBody()).isEqualTo(ApiResponse.failure("COMMON4091",
                    "이미 존재하거나 제약 조건을 위반한 데이터입니다."));
        }
    }

    @Test void missingHibernateCauseKeepsCommonResponseAndRatingDuplicateKeepsExistingCode() {
        assertThat(handler.handleDataIntegrity(new DataIntegrityViolationException("private sql"))
                .getBody().code()).isEqualTo("COMMON4091");
        assertThat(handler.handleIllegalArgument(new IllegalArgumentException("이미 이 영화에 평점을 남기셨습니다."))
                .getBody()).isEqualTo(ApiResponse.failure("COMMON4092", "이미 이 영화에 평점을 남기셨습니다."));
    }
}
