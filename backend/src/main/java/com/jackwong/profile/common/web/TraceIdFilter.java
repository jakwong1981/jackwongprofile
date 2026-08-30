// backend/src/main/java/com/jackwong/profile/common/web/TraceIdFilter.java
package com.jackwong.profile.common.web;

import com.jackwong.profile.common.api.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Assigns (or propagates) a correlation id for every request and exposes it via
 * SLF4J {@link MDC} and the {@code X-Trace-Id} response header.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String incoming = request.getHeader(TRACE_ID_HEADER);
        String traceId = StringUtils.hasText(incoming) ? sanitize(incoming) : newTraceId();
        MDC.put(ApiResponse.TRACE_ID_KEY, traceId);
        response.setHeader(TRACE_ID_HEADER, traceId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(ApiResponse.TRACE_ID_KEY);
        }
    }

    /** Strips anything outside {@code [A-Za-z0-9-]} and caps the length so callers cannot poison the logs. */
    private String sanitize(String candidate) {
        String cleaned = candidate.replaceAll("[^A-Za-z0-9\\-]", "");
        if (cleaned.isEmpty()) {
            return newTraceId();
        }
        return cleaned.length() > 64 ? cleaned.substring(0, 64) : cleaned;
    }

    private String newTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
