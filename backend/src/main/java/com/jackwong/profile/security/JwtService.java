// backend/src/main/java/com/jackwong/profile/security/JwtService.java
package com.jackwong.profile.security;

import com.jackwong.profile.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies the stateless credentials used by the administrative portal.
 */
@Slf4j
@Service
public class JwtService {

    /** Custom claim separating access tokens from refresh tokens. */
    static final String CLAIM_TOKEN_TYPE = "typ";
    static final String TYPE_ACCESS = "access";
    static final String TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final SecurityProperties.Jwt config;

    public JwtService(SecurityProperties properties) {
        this.config = properties.jwt();
        this.signingKey = buildKey(config.secret());
    }

    public String issueAccessToken(String username) {
        return issue(username, TYPE_ACCESS, Duration.ofSeconds(config.accessTokenTtlSeconds()));
    }

    public String issueRefreshToken(String username) {
        return issue(username, TYPE_REFRESH, Duration.ofSeconds(config.refreshTokenTtlSeconds()));
    }

    public long accessTokenTtlSeconds() {
        return config.accessTokenTtlSeconds();
    }

    /**
     * Verifies signature, issuer, expiry, and token type.
     *
     * @param token     raw compact JWT
     * @param tokenType expected value of the {@code typ} claim
     * @return the subject (username) when the token is valid, otherwise empty
     */
    public Optional<String> extractSubject(String token, String tokenType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(config.issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            if (!tokenType.equals(claims.get(CLAIM_TOKEN_TYPE, String.class))) {
                log.debug("Rejected token: expected type {} but found {}", tokenType,
                        claims.get(CLAIM_TOKEN_TYPE, String.class));
                return Optional.empty();
            }
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Rejected token: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    public Optional<String> extractAccessSubject(String token) {
        return extractSubject(token, TYPE_ACCESS);
    }

    public Optional<String> extractRefreshSubject(String token) {
        return extractSubject(token, TYPE_REFRESH);
    }

    private String issue(String subject, String tokenType, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .issuer(config.issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Accepts a Base64 encoded key, falling back to the raw UTF-8 bytes so a developer
     * supplied passphrase still boots locally. Keys shorter than 256 bits are rejected by JJWT.
     */
    private SecretKey buildKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("app.security.jwt.secret must be configured");
        }
        byte[] material;
        try {
            material = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException ex) {
            material = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (material.length < 32) {
            throw new IllegalStateException("app.security.jwt.secret must decode to at least 256 bits");
        }
        return Keys.hmacShaKeyFor(material);
    }
}
