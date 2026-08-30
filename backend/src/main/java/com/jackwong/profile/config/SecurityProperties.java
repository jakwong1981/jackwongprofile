// backend/src/main/java/com/jackwong/profile/config/SecurityProperties.java
package com.jackwong.profile.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Authentication settings for the administrative portal.
 *
 * @param jwt       token signing and lifetime configuration
 * @param bootstrap first-run administrator provisioning
 */
@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(Jwt jwt, Bootstrap bootstrap) {

    /**
     * @param secret                  Base64 encoded HMAC key, at least 256 bits
     * @param issuer                  {@code iss} claim asserted and required on every token
     * @param accessTokenTtlSeconds   access token lifetime
     * @param refreshTokenTtlSeconds  refresh token lifetime
     */
    public record Jwt(String secret, String issuer, long accessTokenTtlSeconds, long refreshTokenTtlSeconds) {
    }

    /**
     * @param enabled     create the account on start-up when the table is empty
     * @param username    initial administrator username
     * @param password    initial plaintext password, hashed with BCrypt before storage
     * @param displayName human readable label
     */
    public record Bootstrap(boolean enabled, String username, String password, String displayName) {
    }
}
