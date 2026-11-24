package com.umc.movie.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {
    private static final String SECRET = "test-only-jwt-secret-at-least-32-bytes-long";

    /** 기본값과 허용 경계값으로 발급한 JWT의 만료 시간이 설정값과 일치한다. */
    @ParameterizedTest
    @ValueSource(longs = {1, 3600, 2592000})
    void acceptsSupportedExpiration(long seconds) {
        JwtUtil jwt = new JwtUtil(SECRET, seconds);
        String token = jwt.createAccessToken(1L, "test@example.com");
        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token).getPayload();
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime()).isEqualTo(seconds * 1000);
    }

    /** 범위를 벗어난 설정은 토큰 발급 이전 생성 시점에 설정 이름을 포함해 거절한다. */
    @ParameterizedTest
    @ValueSource(longs = {0, -1, 2592001, Long.MAX_VALUE})
    void rejectsUnsupportedExpiration(long seconds) {
        assertThatThrownBy(() -> new JwtUtil(SECRET, seconds))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("JWT_ACCESS_EXPIRATION");
    }
}
