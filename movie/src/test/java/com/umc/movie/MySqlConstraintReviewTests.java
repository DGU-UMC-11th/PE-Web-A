package com.umc.movie;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@EnabledIfEnvironmentVariable(named = "RUN_ISOLATED_MYSQL_TESTS", matches = "true")
class MySqlConstraintReviewTests {
    @ParameterizedTest
    @ValueSource(strings = {"legacy", "named", "missing", "multiple", "conflict", "prefix", "composite", "no-database"})
    void preflightOnlyProposesSafeRenamesWithoutChangingAnything(String scenario) throws Exception {
        try (var connection = isolatedConnection()) {
            if (scenario.equals("no-database")) {
                try (var statement = connection.createStatement()) {
                    var rows = review(statement);
                    assertThat(rows).hasSize(2).allSatisfy(row -> {
                        assertThat(row.get("review_status")).isEqualTo("NO_DATABASE_SELECTED");
                        assertThat(row.get("proposed_sql")).isNull();
                    });
                }
                return;
            }
            String schema = "review_" + UUID.randomUUID().toString().replace("-", "");
            try (var bootstrap = connection.createStatement()) {
                bootstrap.execute("CREATE DATABASE `" + schema + "`");
            }
            connection.setCatalog(schema);
            try (var statement = connection.createStatement()) {
            String indexes = switch (scenario) {
                case "legacy" -> ", UNIQUE KEY old_email(email), UNIQUE KEY old_nickname(nickname)";
                case "named" -> ", UNIQUE KEY uk_member_email(email), UNIQUE KEY uk_member_nickname(nickname)";
                case "missing" -> "";
                case "multiple" -> ", UNIQUE KEY old_email(email), UNIQUE KEY duplicate_email(email)";
                case "conflict" -> ", UNIQUE KEY old_email(email), KEY uk_member_email(nickname)";
                case "prefix" -> ", UNIQUE KEY prefix_email(email(10))";
                case "composite" -> ", UNIQUE KEY composite_email(email, nickname)";
                default -> throw new IllegalArgumentException(scenario);
            };
            statement.execute("CREATE TABLE member (id BIGINT PRIMARY KEY, email VARCHAR(254) NOT NULL, nickname VARCHAR(50) NOT NULL" + indexes + ")");
            statement.execute("INSERT INTO member VALUES (1, 'sample@example.com', 'sample')");
            String before = snapshot(statement);
            var rows = review(statement);
            assertThat(snapshot(statement)).isEqualTo(before);
            var email = rows.stream().filter(row -> row.get("column_name").equals("email")).findFirst().orElseThrow();
            String expected = switch (scenario) {
                case "legacy" -> "RENAME_REQUIRES_APPROVAL";
                case "named" -> "ALREADY_NAMED";
                case "missing", "composite" -> "MISSING_SINGLE_COLUMN_UNIQUE";
                case "multiple" -> "MULTIPLE_UNIQUE_INDEXES_REVIEW_REQUIRED";
                case "conflict" -> "TARGET_NAME_CONFLICT";
                case "prefix" -> "PREFIX_UNIQUE_REVIEW_REQUIRED";
                default -> throw new IllegalArgumentException(scenario);
            };
            assertThat(email.get("review_status")).isEqualTo(expected);
            if (scenario.equals("legacy")) {
                // 새 임시 스키마에서만 제안된 rename을 검증한다. 인덱스 추가/삭제는 없다.
                for (var row : rows) statement.execute(row.get("proposed_sql"));
                assertThat(snapshot(statement)).isEqualTo(before.replace("old_email", "uk_member_email")
                        .replace("old_nickname", "uk_member_nickname"));
                assertThat(review(statement)).allSatisfy(row -> {
                    assertThat(row.get("review_status")).isEqualTo("ALREADY_NAMED");
                    assertThat(row.get("proposed_sql")).isNull();
                });
            } else {
                assertThat(email.get("proposed_sql")).isNull();
            }
            System.out.println("MySQL preflight " + scenario + ": " + expected + "; original rows and indexes preserved");
            }
        }
    }

    private Connection isolatedConnection() throws Exception {
        Connection connection = DriverManager.getConnection("jdbc:mysql://127.0.0.1:13316/", "root", "");
        try (var statement = connection.createStatement(); var rows = statement.executeQuery("SELECT @@datadir, VERSION()")) {
            rows.next();
            if (!rows.getString(1).replace('\\', '/').endsWith("/.mysql-challenge-validation/data/")
                    || !rows.getString(2).startsWith("8.0.")) {
                connection.close();
                throw new IllegalStateException("Refusing to use a non-isolated database");
            }
        }
        return connection;
    }

    private List<Map<String, String>> review(Statement statement) throws Exception {
        String sql = Files.readString(Path.of("sql/member-unique-constraints.sql"));
        List<Map<String, String>> result = new ArrayList<>();
        try (var rows = statement.executeQuery(sql)) {
            while (rows.next()) {
                Map<String, String> row = new HashMap<>();
                for (String name : List.of("column_name", "review_status", "proposed_sql")) row.put(name, rows.getString(name));
                result.add(row);
            }
        }
        return result;
    }

    private String snapshot(Statement statement) throws Exception {
        StringBuilder result = new StringBuilder();
        try (var rows = statement.executeQuery("SHOW CREATE TABLE member")) {
            rows.next(); result.append(rows.getString(2));
        }
        try (var rows = statement.executeQuery("SELECT id, email, nickname FROM member ORDER BY id")) {
            while (rows.next()) result.append(rows.getLong(1)).append(rows.getString(2)).append(rows.getString(3));
        }
        return result.toString();
    }
}
