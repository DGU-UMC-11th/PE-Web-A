package com.umc.movie.exception;

import java.sql.SQLException;
import java.util.regex.Pattern;
import org.hibernate.exception.ConstraintViolationException;

public final class IntegrityViolationClassifier {
    /** 정적 판별 함수만 사용하도록 인스턴스 생성을 막는다. */
    private IntegrityViolationClassifier() {}

    /** 중복 키 오류 중 지정한 제약 조건 위반만 식별한다. */
    public static boolean isDuplicateConstraint(Throwable error, String name) {
        if (!isUniqueViolation(error)) return false;
        Pattern pattern = Pattern.compile("(?i)(?<![a-z0-9_])" + Pattern.quote(name)
                + "(?:_index_[a-z0-9]+)?(?![a-z0-9_])");
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException constraint
                    && constraint.getConstraintName() != null
                    && pattern.matcher(constraint.getConstraintName()).find()) return true;
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
