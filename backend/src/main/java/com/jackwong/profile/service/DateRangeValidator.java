// backend/src/main/java/com/jackwong/profile/service/DateRangeValidator.java
package com.jackwong.profile.service;

import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import java.time.LocalDate;

/**
 * Cross-field date rules that cannot be expressed with bean validation annotations.
 */
public final class DateRangeValidator {

    private DateRangeValidator() {
    }

    /**
     * Enforces the resume invariants: an end date may not precede the start date, and an
     * ongoing role must not carry an end date.
     *
     * @param label       human readable subject used in the error message
     * @param startDate   first day, may be {@code null} for open-ended records
     * @param endDate     last day, may be {@code null}
     * @param currentFlag whether the record is marked as ongoing
     * @throws BusinessException when the combination is inconsistent
     */
    public static void validate(String label, LocalDate startDate, LocalDate endDate, boolean currentFlag) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "%s end date must not precede the start date".formatted(label));
        }
        if (currentFlag && endDate != null) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "%s is marked as current and must not carry an end date".formatted(label));
        }
        if (!currentFlag && startDate != null && endDate == null) {
            // A finished record without an end date is allowed (open-ended), but a future
            // start date is always a data entry mistake.
            if (startDate.isAfter(LocalDate.now().plusYears(1))) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "%s start date is unrealistically far in the future".formatted(label));
            }
        }
    }
}
