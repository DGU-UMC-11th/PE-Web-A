package com.umc.movie;

import com.umc.movie.exception.IntegrityViolationClassifier;
import java.sql.SQLException;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class IntegrityViolationClassifierTest {
    @Test void mysqlUniqueCodeDoesNotConfuseForeignKeyWithDuplicate() {
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("duplicate", "23000", 1062))).isTrue();
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("foreign key", "23000", 1452))).isFalse();
        assertThat(IntegrityViolationClassifier.isUniqueViolation(new SQLException("length", "22001", 1406))).isFalse();
    }

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
