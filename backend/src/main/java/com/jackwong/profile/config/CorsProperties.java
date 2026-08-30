// backend/src/main/java/com/jackwong/profile/config/CorsProperties.java
package com.jackwong.profile.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cross-origin policy for the browser clients (public site and admin portal).
 *
 * @param allowedOrigins  exact origins permitted to call the API
 * @param allowedMethods  permitted HTTP methods
 * @param allowedHeaders  permitted request headers
 * @param allowCredentials whether cookies / auth headers may be sent
 * @param maxAge          pre-flight cache lifetime in seconds
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(
        List<String> allowedOrigins,
        List<String> allowedMethods,
        List<String> allowedHeaders,
        boolean allowCredentials,
        long maxAge) {
}
