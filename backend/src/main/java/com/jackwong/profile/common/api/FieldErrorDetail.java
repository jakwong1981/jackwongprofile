// backend/src/main/java/com/jackwong/profile/common/api/FieldErrorDetail.java
package com.jackwong.profile.common.api;

/**
 * Single field level validation failure.
 *
 * @param field   dotted path of the offending property
 * @param message localised validation message
 */
public record FieldErrorDetail(String field, String message) {
}
