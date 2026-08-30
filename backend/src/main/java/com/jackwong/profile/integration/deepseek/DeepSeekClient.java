// backend/src/main/java/com/jackwong/profile/integration/deepseek/DeepSeekClient.java
package com.jackwong.profile.integration.deepseek;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackwong.profile.common.exception.UpstreamServiceException;
import com.jackwong.profile.config.DeepSeekProperties;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Thin client over the DeepSeek chat-completions API. The model is instructed to answer
 * with a strict JSON object so the response can be bound to {@link ArticleAnalysis}.
 */
@Slf4j
@Component
public class DeepSeekClient {

    private static final String COMPLETIONS_PATH = "/chat/completions";

    private static final String SYSTEM_PROMPT = """
            You are an analyst covering artificial intelligence research and industry news.
            Answer with a single JSON object and nothing else. Use this exact schema:
            {
              "summary": "2-4 sentence executive summary in English",
              "keyPoints": ["3 to 5 short takeaways"],
              "keywords": [{"term": "technical term", "definition": "one sentence, jargon free"}],
              "category": "one of: RESEARCH, PRODUCT, FUNDING, POLICY, INFRASTRUCTURE, SAFETY, OPINION, OTHER",
              "impactLevel": "one of: LOW, MEDIUM, HIGH, CRITICAL",
              "language": "IETF tag of the source article, e.g. en"
            }
            Extract between 3 and 8 keywords. Never invent facts that are not supported by the
            supplied text; when the text is too thin, summarise only what is present.
            """;

    private final DeepSeekProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public DeepSeekClient(DeepSeekProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = buildRestClient(properties);
    }

    /**
     * @return whether the integration is configured and switched on
     */
    public boolean isEnabled() {
        return properties.isUsable();
    }

    /**
     * Summarises, classifies, and extracts a glossary for one article.
     *
     * @param title   article headline
     * @param source  human readable source name
     * @param url     canonical article URL
     * @param excerpt article body or excerpt; may be blank
     * @return the parsed analysis
     * @throws UpstreamServiceException when the integration is disabled or the call fails
     */
    public ArticleAnalysis analyze(String title, String source, String url, String excerpt) {
        if (!isEnabled()) {
            throw new UpstreamServiceException("DeepSeek integration is disabled or missing an API key");
        }

        Map<String, Object> body = Map.of(
                "model", properties.model(),
                "temperature", properties.temperature(),
                "max_tokens", properties.maxTokens(),
                "stream", false,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", buildUserPrompt(title, source, url, excerpt))));

        try {
            String raw = restClient.post()
                    .uri(COMPLETIONS_PATH)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return parse(raw);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException("DeepSeek request failed: " + ex.getMessage(), ex);
        }
    }

    /**
     * Extracts {@code choices[0].message.content} and binds the embedded JSON document.
     *
     * @param rawResponse full chat-completions response body
     * @return the parsed analysis
     */
    ArticleAnalysis parse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new UpstreamServiceException("DeepSeek returned an empty response");
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new UpstreamServiceException("DeepSeek response carried no message content");
            }
            return objectMapper.readValue(stripCodeFence(content.asText()), ArticleAnalysis.class);
        } catch (UpstreamServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new UpstreamServiceException("Unable to parse the DeepSeek response: " + ex.getMessage(), ex);
        }
    }

    /** Models occasionally wrap JSON in a Markdown fence even when asked not to. */
    static String stripCodeFence(String content) {
        String trimmed = content.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }
        int firstNewline = trimmed.indexOf('\n');
        if (firstNewline < 0) {
            return trimmed;
        }
        String withoutOpening = trimmed.substring(firstNewline + 1);
        int closing = withoutOpening.lastIndexOf("```");
        return (closing < 0 ? withoutOpening : withoutOpening.substring(0, closing)).trim();
    }

    private String buildUserPrompt(String title, String source, String url, String excerpt) {
        String safeExcerpt = excerpt == null || excerpt.isBlank() ? "(no excerpt available)" : excerpt;
        int limit = Math.min(safeExcerpt.length(), 6000);
        return """
                Source: %s
                URL: %s
                Title: %s
                Excerpt:
                %s
                """.formatted(source, url, title, safeExcerpt.substring(0, limit));
    }

    private RestClient buildRestClient(DeepSeekProperties props) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(props.connectTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(props.readTimeoutMs()));
        return RestClient.builder()
                .baseUrl(props.baseUrl())
                .requestFactory(factory)
                .build();
    }
}
