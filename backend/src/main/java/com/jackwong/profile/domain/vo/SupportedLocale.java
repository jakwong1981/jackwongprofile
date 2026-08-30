// backend/src/main/java/com/jackwong/profile/domain/vo/SupportedLocale.java
package com.jackwong.profile.domain.vo;

import java.util.Arrays;
import lombok.Getter;

/**
 * Locales supported for runtime switching across the public site and the admin portal.
 */
@Getter
public enum SupportedLocale {

    EN("en"),
    ZH_HANT("zh-Hant"),
    ZH_HANS("zh-Hans");

    /** Default used whenever a requested tag cannot be resolved. */
    public static final SupportedLocale DEFAULT = EN;

    private final String tag;

    SupportedLocale(String tag) {
        this.tag = tag;
    }

    /**
     * Resolves an IETF-ish language tag to a supported locale, tolerating the common
     * legacy aliases ({@code zh-TW}, {@code zh-HK}, {@code zh-CN}, {@code zh}).
     *
     * @param tag candidate language tag, may be {@code null}
     * @return the matching locale, or {@link #DEFAULT} when unresolvable
     */
    public static SupportedLocale fromTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return DEFAULT;
        }
        String normalized = tag.trim().toLowerCase();
        return Arrays.stream(values())
                .filter(locale -> locale.tag.toLowerCase().equals(normalized))
                .findFirst()
                .orElseGet(() -> switch (normalized) {
                    case "zh-tw", "zh-hk", "zh-mo", "zh-hant-tw", "zh-hant-hk" -> ZH_HANT;
                    case "zh-cn", "zh-sg", "zh", "zh-hans-cn" -> ZH_HANS;
                    default -> normalized.startsWith("zh") ? ZH_HANT : DEFAULT;
                });
    }
}
