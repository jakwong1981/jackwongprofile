// backend/src/main/java/com/jackwong/profile/common/api/ApiResponse.java
package com.jackwong.profile.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.MDC;

/**
 * Uniform envelope returned by every endpoint of the service.
 *
 * @param code      business status code, aligned with the HTTP status family
 * @param message   human readable outcome description
 * @param data      payload, {@code null} for empty or failed responses
 * @param errors    field level validation errors, {@code null} when not applicable
 * @param traceId   correlation id, mirrored in the {@code X-Trace-Id} response header
 * @param timestamp server side generation instant
 * @param <T>       payload type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        int code,
        String message,
        T data,
        List<FieldErrorDetail> errors,
        String traceId,
        OffsetDateTime timestamp) {

    public static final String TRACE_ID_KEY = "traceId";

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, "OK");
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), message, data, null, currentTraceId(),
                OffsetDateTime.now());
    }

    public static ApiResponse<Void> empty(String message) {
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), message, null, null, currentTraceId(),
                OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return new ApiResponse<>(errorCode.getCode(), message, null, null, currentTraceId(), OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message, List<FieldErrorDetail> errors) {
        return new ApiResponse<>(errorCode.getCode(), message, null, errors, currentTraceId(), OffsetDateTime.now());
    }

    private static String currentTraceId() {
        return MDC.get(TRACE_ID_KEY);
    }
}
