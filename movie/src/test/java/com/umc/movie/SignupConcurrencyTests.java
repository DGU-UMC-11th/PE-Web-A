package com.umc.movie;

import com.umc.movie.controller.GlobalExceptionHandler;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import javax.sql.DataSource;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:signup;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Import(SignupConcurrencyTests.Config.class)
class SignupConcurrencyTests {
    @LocalServerPort int port;
    @Autowired MemberRepository repository;
    @Autowired RaceEncoder encoder;
    @Autowired DataSource dataSource;
    @MockitoSpyBean GlobalExceptionHandler handler;
    private final HttpClient client = HttpClient.newHttpClient();

    @Test void emailUniqueViolationAfterBothPrechecksPassed() throws Exception {
        race("email", "race@example.com", "race@example.com", "alpha", "beta", "MEMBER4091", "이미 사용 중인 이메일입니다.");
    }

    @Test void nicknameUniqueViolationAfterBothPrechecksPassed() throws Exception {
        race("nickname", "one@example.com", "two@example.com", "same", "same", "MEMBER4092", "이미 사용 중인 닉네임입니다.");
    }

    private void race(String field, String email1, String email2, String nick1, String nick2,
                      String code, String message) throws Exception {
        repository.deleteAll();
        clearInvocations(handler);
        encoder.barrier.set(new CyclicBarrier(2));
        CompletableFuture<HttpResponse<String>> first = send(email1, nick1);
        CompletableFuture<HttpResponse<String>> second = send(email2, nick2);
        HttpResponse<String> a = first.get(20, TimeUnit.SECONDS);
        HttpResponse<String> b = second.get(20, TimeUnit.SECONDS);
        encoder.barrier.set(null);
        assertThat(java.util.List.of(a.statusCode(), b.statusCode())).containsExactlyInAnyOrder(201, 409);
        HttpResponse<String> conflict = a.statusCode() == 409 ? a : b;
        assertThat(conflict.body()).contains("\"isSuccess\":false", "\"code\":\"" + code + "\"",
                "\"message\":\"" + message + "\"", "\"result\":null");
        var captured = ArgumentCaptor.forClass(DataIntegrityViolationException.class);
        verify(handler).handleDataIntegrity(captured.capture());
        org.hibernate.exception.ConstraintViolationException constraint = null;
        for (Throwable cause = captured.getValue(); cause != null; cause = cause.getCause()) {
            if (cause instanceof org.hibernate.exception.ConstraintViolationException violation) {
                constraint = violation;
            }
        }
        assertThat(constraint).isNotNull();
        assertThat(constraint.getConstraintName().toLowerCase()).contains("uk_member_" + field);
        String database;
        try (var connection = dataSource.getConnection()) {
            database = connection.getMetaData().getDatabaseProductName();
        }
        assertThat(constraint.getSQLException().getErrorCode()).isEqualTo(database.equals("MySQL") ? 1062 : 23505);
        assertThat(repository.count()).isEqualTo(1);

        // 닉네임 사전 검사는 이메일이 중복되지 않는 요청으로 검증한다.
        HttpResponse<String> repeated = field.equals("nickname")
                ? send("fresh@example.com", "same").get(20, TimeUnit.SECONDS)
                : send(email1, "fresh").get(20, TimeUnit.SECONDS);
        assertThat(repeated.statusCode()).isEqualTo(409);
        assertThat(repeated.body()).isEqualTo(conflict.body());
        String evidence = "REAL HTTP + " + database + " UNIQUE constraint reproduction\n"
                + "POST /members (two concurrent requests)\n"
                + "Both requests passed existsByEmail + existsByNickname.\n"
                + "Test-only password encoder barrier released both before INSERT.\n"
                + "Request A: email=" + email1 + ", nickname=" + nick1 + "\nHTTP " + a.statusCode() + "\n" + a.body()
                + "\nRequest B: email=" + email2 + ", nickname=" + nick2 + "\nHTTP " + b.statusCode() + "\n" + b.body()
                + "\nVerified: DataIntegrityViolationException reached GlobalExceptionHandler.\n"
                + "Constraint: " + constraint.getConstraintName()
                + ", DB error: " + constraint.getSQLException().getErrorCode() + "\n"
                + "Persisted rows: " + repository.count()
                + "\nRepeated request (precheck): HTTP " + repeated.statusCode() + "\n" + repeated.body() + "\n";
        Files.createDirectories(Path.of("build/evidence"));
        Files.writeString(Path.of("build/evidence/" + database.toLowerCase() + "-" + field + ".txt"), evidence);
        System.out.println(evidence);
    }

    private CompletableFuture<HttpResponse<String>> send(String email, String nickname) {
        String json = "{\"email\":\"" + email + "\",\"nickname\":\"" + nickname
                + "\",\"password\":\"Aa\\\\d!12345\"}";
        return client.sendAsync(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/members"))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    @TestConfiguration
    static class Config {
        @Bean @Primary RaceEncoder raceEncoder() { return new RaceEncoder(); }
    }

    static class RaceEncoder implements PasswordEncoder {
        final AtomicReference<CyclicBarrier> barrier = new AtomicReference<>();
        public String encode(CharSequence raw) {
            CyclicBarrier current = barrier.get();
            if (current != null) {
                try { current.await(10, TimeUnit.SECONDS); }
                catch (Exception e) { throw new IllegalStateException("Concurrent requests did not pass both prechecks", e); }
            }
            return "test-only-encoded-password";
        }
        public boolean matches(CharSequence raw, String encoded) { return false; }
    }
}
