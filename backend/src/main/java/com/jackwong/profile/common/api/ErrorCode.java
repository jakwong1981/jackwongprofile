// backend/src/main/java/com/jackwong/profile/common/api/ErrorCode.java
package com.jackwong.profile.common.api;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Canonical catalogue of business status codes returned inside {@link ApiResponse}.
 */
@Getter
public enum ErrorCode {

    SUCCESS(200, HttpStatus.OK, "OK"),
    VALIDATION_FAILED(40001, HttpStatus.BAD_REQUEST, "Request validation failed"),
    MALFORMED_REQUEST(40002, HttpStatus.BAD_REQUEST, "Malformed request payload"),
    UNAUTHORIZED(40101, HttpStatus.UNAUTHORIZED, "Authentication is required"),
    INVALID_CREDENTIALS(40102, HttpStatus.UNAUTHORIZED, "Invalid username or password"),
    TOKEN_EXPIRED(40103, HttpStatus.UNAUTHORIZED, "Authentication token has expired"),
    FORBIDDEN(40301, HttpStatus.FORBIDDEN, "Operation is not permitted"),
    RESOURCE_NOT_FOUND(40401, HttpStatus.NOT_FOUND, "Requested resource was not found"),
    METHOD_NOT_ALLOWED(40501, HttpStatus.METHOD_NOT_ALLOWED, "HTTP method is not supported"),
    RESOURCE_CONFLICT(40901, HttpStatus.CONFLICT, "Resource conflicts with the current state"),
    OPTIMISTIC_LOCK(40902, HttpStatus.CONFLICT, "Resource was modified by another session"),
    UNSUPPORTED_MEDIA_TYPE(41501, HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type"),
    BUSINESS_RULE_VIOLATION(42201, HttpStatus.UNPROCESSABLE_ENTITY, "Business rule violated"),
    INTERNAL_ERROR(50001, HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected internal error"),
    UPSTREAM_UNAVAILABLE(50301, HttpStatus.SERVICE_UNAVAILABLE, "Upstream dependency is unavailable");

    private final int code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(int code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }
}
