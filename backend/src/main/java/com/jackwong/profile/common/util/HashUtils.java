// backend/src/main/java/com/jackwong/profile/common/util/HashUtils.java
package com.jackwong.profile.common.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Deterministic identifiers derived from article URLs, used as the deduplication key.
 */
public final class HashUtils {

    private HashUtils() {
    }

    /**
     * Normalises a URL (lowercase scheme/host, no fragment, no trailing slash) and returns
     * its SHA-256 digest as lowercase hex.
     *
     * @param url absolute article URL
     * @return 64 character hex digest
     */
    public static String sha256Hex(String url) {
        String canonical = canonicalize(url);
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable in this JVM", ex);
        }
    }

    /**
     * @param url raw URL
     * @return a stable textual form so the same article never yields two digests
     */
    public static String canonicalize(String url) {
        String trimmed = url == null ? "" : url.trim();
        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme() == null ? "https" : uri.getScheme().toLowerCase(Locale.ROOT);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            String path = uri.getPath() == null ? "" : uri.getPath();
            if (path.length() > 1 && path.endsWith("/")) {
                path = path.substring(0, path.length() - 1);
            }
            String query = uri.getQuery() == null ? "" : "?" + uri.getQuery();
            return scheme + "://" + host + path + query;
        } catch (URISyntaxException ex) {
            return trimmed.toLowerCase(Locale.ROOT);
        }
    }
}
