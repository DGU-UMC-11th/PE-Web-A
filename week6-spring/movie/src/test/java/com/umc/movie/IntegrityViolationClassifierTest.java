package com.umc.movie;

import com.umc.movie.exception.IntegrityViolationClassifier;
import java.sql.SQLException;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class IntegrityViolationClassifierTest {
    /** MySQL 오류 번호와 SQL 상태로 UNIQUE와 다른 제약 위반을 구분하는지 검증한다. */
    @Test void mysqlUniqueCodeDoesNotConfuseForeignKeyWithDuplicate() {
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("duplicate", "23000", 1062))).isTrue();
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("foreign key", "23000", 1452))).isFalse();
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("length", "22001", 1406))).isFalse();
    }

    /** 정확한 평점 복합 UNIQUE 위반만 평점 중복으로 분류하는지 검증한다. */
    @Test void onlyTheRatingCompositeUniqueConstraintGetsTheRatingCode() {
        SQLException duplicate = new SQLException("duplicate", "23000", 1062);
        assertThat(IntegrityViolationClassifier.isDuplicateRating(
                new ConstraintViolationException("duplicate", duplicate, "rating.uk_rating_member_movie"))).isTrue();
        assertThat(IntegrityViolationClassifier.isDuplicateRating(
                new ConstraintViolationException("duplicate", duplicate, "PRIMARY"))).isFalse();
        assertThat(IntegrityViolationClassifier.isDuplicateRating(
                new ConstraintViolationException("duplicate", duplicate, "uk_rating_member_movie_other"))).isFalse();
        assertThat(IntegrityViolationClassifier.isDuplicateRating(
                new ConstraintViolationException("foreign key", new SQLException("fk", "23000", 1452), "uk_rating_member_movie"))).isFalse();
    }
}
