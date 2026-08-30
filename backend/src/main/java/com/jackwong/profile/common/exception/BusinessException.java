// backend/src/main/java/com/jackwong/profile/common/exception/BusinessException.java
package com.jackwong.profile.common.exception;

import com.jackwong.profile.common.api.ErrorCode;
import lombok.Getter;

/**
 * Base type for every intentionally raised, client visible failure.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }
}
