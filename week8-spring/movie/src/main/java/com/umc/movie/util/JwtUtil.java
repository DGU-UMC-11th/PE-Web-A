package com.umc.movie.util;

import com.umc.movie.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {
    // 지원 범위를 30일로 제한해 만료 시각의 Instant 및 Date 변환 오버플로를 방지한다.
    public static final long MAX_EXPIRATION_SECONDS = 30L * 24 * 60 * 60;
    private final SecretKey key;
    private final long expirationSeconds;

    /** 비밀키와 초 단위 유효시간을 환경 설정에서 읽는다. 짧은 키는 시작 시 거절한다. */
    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.access-expiration}") long expirationSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        if (expirationSeconds <= 0 || expirationSeconds > MAX_EXPIRATION_SECONDS) {
            throw new IllegalArgumentException("JWT_ACCESS_EXPIRATION은 1~" + MAX_EXPIRATION_SECONDS + "초여야 합니다.");
        }
        this.expirationSeconds = expirationSeconds;
    }

    /** 로그인에 성공한 회원 ID를 subject로 가진 서명된 토큰을 발급한다. */
    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();
        return Jwts.builder().subject(memberId.toString()).claim("email", email)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key).compact();
    }

    /** 서명·만료 시각·회원 ID를 검증하고 만료와 잘못된 토큰을 구분한다. */
    public Long getMemberId(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            long memberId = Long.parseLong(claims.getSubject());
            if (memberId <= 0 || claims.getExpiration() == null) throw new IllegalArgumentException();
            return memberId;
        } catch (ExpiredJwtException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_4", "토큰이 만료되었습니다. 다시 로그인해주세요.");
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_3", "유효하지 않은 토큰입니다.");
        }
    }
}
