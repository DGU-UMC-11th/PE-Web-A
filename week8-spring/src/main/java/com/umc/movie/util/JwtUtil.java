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
    private final SecretKey secretKey;
    private final long accessExpiration;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.access-expiration}") long accessExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        if (accessExpiration <= 0) {
            throw new IllegalArgumentException("JWT 유효시간은 양수 초 단위여야 합니다.");
        }
        this.accessExpiration = accessExpiration;
    }

    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();
        return Jwts.builder().subject(memberId.toString()).claim("email", email)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(accessExpiration)))
                .signWith(secretKey, Jwts.SIG.HS256).compact();
    }

    public Long getMemberId(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
            Long memberId = Long.valueOf(claims.getSubject());
            if (memberId <= 0 || claims.getExpiration() == null) {
                throw new IllegalArgumentException("필수 claim이 올바르지 않습니다.");
            }
            return memberId;
        } catch (ExpiredJwtException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_4", "토큰이 만료되었습니다. 다시 로그인해주세요.");
        } catch (JwtException | IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_3", "유효하지 않은 토큰입니다.");
        }
    }
}
