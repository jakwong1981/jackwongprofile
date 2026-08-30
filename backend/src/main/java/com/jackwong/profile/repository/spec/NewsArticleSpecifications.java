// backend/src/main/java/com/jackwong/profile/repository/spec/NewsArticleSpecifications.java
package com.jackwong.profile.repository.spec;

import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.domain.entity.NewsArticle;
import java.time.Instant;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * Type-safe, fully parameterised predicates for the news dashboard query.
 * Using the Criteria API guarantees that no user supplied value ever reaches SQL as text.
 */
public final class NewsArticleSpecifications {

    private NewsArticleSpecifications() {
    }

    public static Specification<NewsArticle> sourceKeyEquals(String sourceKey) {
        return (root, query, cb) -> sourceKey == null || sourceKey.isBlank()
                ? cb.conjunction()
                : cb.equal(root.get("sourceKey"), sourceKey);
    }

    public static Specification<NewsArticle> categoryEquals(String category) {
        return (root, query, cb) -> category == null || category.isBlank()
                ? cb.conjunction()
                : cb.equal(root.get("category"), category);
    }

    public static Specification<NewsArticle> analysisStatusEquals(AnalysisStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("analysisStatus"), status);
    }

    public static Specification<NewsArticle> publishedAfter(Instant from) {
        return (root, query, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("publishedAt"), from);
    }

    public static Specification<NewsArticle> publishedBefore(Instant to) {
        return (root, query, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("publishedAt"), to);
    }

    /**
     * Case-insensitive contains match across title, excerpt, and generated summary.
     *
     * @param keyword raw search term, may be {@code null} or blank
     * @return the predicate, or a tautology when no term was supplied
     */
    public static Specification<NewsArticle> keywordMatches(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + escapeLike(keyword.trim().toLowerCase(Locale.ROOT)) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern, '\\'),
                    cb.like(cb.lower(root.get("excerpt")), pattern, '\\'),
                    cb.like(cb.lower(root.get("summary")), pattern, '\\'));
        };
    }

    /** Neutralises LIKE wildcards so a search for "100%" cannot widen the match. */
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
