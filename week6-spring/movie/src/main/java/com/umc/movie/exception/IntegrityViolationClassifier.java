package com.umc.movie.exception;

import java.sql.SQLException;

public final class IntegrityViolationClassifier {
    private IntegrityViolationClassifier() {}

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
