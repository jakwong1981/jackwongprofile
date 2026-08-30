// backend/src/main/java/com/jackwong/profile/domain/vo/LocalizedText.java
package com.jackwong.profile.domain.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Size;

/**
 * Immutable multilingual text value object shared by the persistence and the API layer.
 * Every translation is optional; {@link #resolve(SupportedLocale)} applies a deterministic
 * fallback chain so a partially translated profile still renders in every locale.
 *
 * @param en     English translation
 * @param zhHant Traditional Chinese translation
 * @param zhHans Simplified Chinese translation
 */
public record LocalizedText(
        @Size(max = 20000, message = "English text must not exceed 20000 characters") String en,
        @Size(max = 20000, message = "Traditional Chinese text must not exceed 20000 characters") String zhHant,
        @Size(max = 20000, message = "Simplified Chinese text must not exceed 20000 characters") String zhHans) {

    private static final LocalizedText EMPTY = new LocalizedText(null, null, null);

    public static LocalizedText empty() {
        return EMPTY;
    }

    public static LocalizedText of(String en) {
        return new LocalizedText(en, null, null);
    }

    public static LocalizedText of(String en, String zhHant, String zhHans) {
        return new LocalizedText(en, zhHant, zhHans);
    }

    /**
     * Returns the translation for the requested locale, falling back — in order — to the
     * other Chinese variant (for Chinese requests), then English, then any non blank value.
     *
     * @param locale requested locale, {@code null} is treated as {@link SupportedLocale#DEFAULT}
     * @return the best available translation, or {@code null} when the value carries no text at all
     */
    public String resolve(SupportedLocale locale) {
        SupportedLocale target = locale == null ? SupportedLocale.DEFAULT : locale;
        return switch (target) {
            case EN -> firstNonBlank(en, zhHant, zhHans);
            case ZH_HANT -> firstNonBlank(zhHant, zhHans, en);
            case ZH_HANS -> firstNonBlank(zhHans, zhHant, en);
        };
    }

    @JsonIgnore
    public boolean isEmpty() {
        return firstNonBlank(en, zhHant, zhHans) == null;
    }

    /**
     * Merges a patch on top of this value: non {@code null} components of {@code patch} win,
     * {@code null} components keep the current translation.
     *
     * @param patch incoming partial value, may be {@code null}
     * @return merged value
     */
    public LocalizedText merge(LocalizedText patch) {
        if (patch == null) {
            return this;
        }
        return new LocalizedText(
                patch.en() != null ? patch.en() : en,
                patch.zhHant() != null ? patch.zhHant() : zhHant,
                patch.zhHans() != null ? patch.zhHans() : zhHans);
    }

    private static String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }
}
