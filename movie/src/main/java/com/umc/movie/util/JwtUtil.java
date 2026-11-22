package com.umc.movie.util;

import com.umc.movie.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final Duration accessExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") Long accessExpiration
    ) {
        // 문자열 비밀키를 서명용 열쇠 객체로 바꿉니다.
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = Duration.ofSeconds(accessExpiration);
    }

    // 로그인에 성공한 회원에게 줄 토큰(팔찌)을 만듭니다.
    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(String.valueOf(memberId)) // 토큰의 주인 = memberId
                .claim("email", email)             // 참고용 부가 정보
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessExpiration))) // 만료 시각
                .signWith(secretKey)               // 비밀키로 서명 → 내용을 바꾸면 걸립니다
                .compact();
    }

    // 토큰을 검사하고, 통과하면 그 안의 memberId를 꺼냅니다.
    public Long getMemberId(String token) {
        try {
            return Long.valueOf(getClaims(token).getPayload().getSubject());
        } catch (ExpiredJwtException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_4",
                    "토큰이 만료되었습니다. 다시 로그인해주세요.");
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_3",
                    "유효하지 않은 토큰입니다.");
        }
    }

    private Jws<Claims> getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)  // 이 키로 서명을 다시 계산해서 대조합니다
                .clockSkewSeconds(60)   // 시계가 조금 어긋나도 되도록 60초 여유
                .build()
                .parseSignedClaims(token);
    }
}