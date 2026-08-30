// backend/src/main/java/com/jackwong/profile/config/DeepSeekProperties.java
package com.jackwong.profile.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Connection settings for the DeepSeek chat-completions API used to analyse news articles.
 *
 * @param enabled          master switch; when {@code false} analysis is skipped, never failed
 * @param baseUrl          API root, for example {@code https://api.deepseek.com}
 * @param apiKey           bearer credential
 * @param model            model identifier, for example {@code deepseek-chat}
 * @param temperature      sampling temperature, kept low for deterministic extraction
 * @param maxTokens        response budget
 * @param connectTimeoutMs TCP connect timeout
 * @param readTimeoutMs    socket read timeout
 */
@ConfigurationProperties(prefix = "app.deepseek")
public record DeepSeekProperties(
        boolean enabled,
        String baseUrl,
        String apiKey,
        String model,
        double temperature,
        int maxTokens,
        int connectTimeoutMs,
        int readTimeoutMs) {

    /**
     * @return {@code true} only when the integration is switched on and a credential is present
     */
    public boolean isUsable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
