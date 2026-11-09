package com.umc.movie.exception;

import java.sql.SQLException;
import java.util.regex.Pattern;
import org.hibernate.exception.ConstraintViolationException;

public final class IntegrityViolationClassifier {
    private static final Pattern RATING_UNIQUE = Pattern.compile(
            "(?i)(?<![a-z0-9_])uk_rating_member_movie(?:_index_[a-z0-9]+)?(?![a-z0-9_])");

    private IntegrityViolationClassifier() {}

    /** 중복 키 오류 중 회원·영화 복합 UNIQUE 제약에 해당하는 경우만 판별한다. */
    public static boolean isDuplicateRating(Throwable error) {
        if (!isUniqueViolation(error)) return false;
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException constraint
                    && constraint.getConstraintName() != null
                    && RATING_UNIQUE.matcher(constraint.getConstraintName()).find()) return true;
        }
        return false;
    }

    /** H2의 23505 또는 MySQL의 1062만 중복 키 위반으로 판별한다. */
    public static boolean isUniqueViolation(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql) {
                for (SQLException current = sql; current != null; current = current.getNextException()) {
                    if ("23505".equals(current.getSQLState())
                            || (current.getErrorCode() == 1062 && "23000".equals(current.getSQLState()))) return true;
                }
            }
        }
        return false;
    }
}
