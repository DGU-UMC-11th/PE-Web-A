package com.umc.movie;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.sql.DriverManager;
import java.util.UUID;

/** 기존 DB를 쓰지 않는다. 별도로 초기화한 로컬 MySQL 8 인스턴스만 허용한다. */
@EnabledIfEnvironmentVariable(named = "RUN_ISOLATED_MYSQL_TESTS", matches = "true")
class MySqlSignupConcurrencyTests extends SignupConcurrencyTests {
    @DynamicPropertySource
    static void isolatedMysql(DynamicPropertyRegistry properties) throws Exception {
        String server = "jdbc:mysql://127.0.0.1:13316/";
        String schema = "challenge_" + UUID.randomUUID().toString().replace("-", "");
        try (var connection = DriverManager.getConnection(server, "root", "");
             var statement = connection.createStatement();
             var result = statement.executeQuery("SELECT @@datadir, VERSION()")) {
            result.next();
            String dataDir = result.getString(1).replace('\\', '/');
            if (!dataDir.endsWith("/.mysql-challenge-validation/data/")
                    || !result.getString(2).startsWith("8.0.")) {
                throw new IllegalStateException("Refusing to use any existing or non-isolated database");
            }
            result.close();
            statement.execute("CREATE DATABASE `" + schema + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
        }
        properties.add("spring.datasource.url", () -> server + schema);
        properties.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        properties.add("spring.datasource.username", () -> "root");
        properties.add("spring.datasource.password", () -> "");
        // 새로 생성한 빈 스키마에만 테이블을 만든다. 기존 스키마를 선택할 수 없다.
        properties.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }
}
