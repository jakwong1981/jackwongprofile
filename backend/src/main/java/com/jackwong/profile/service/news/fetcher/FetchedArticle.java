// backend/src/main/java/com/jackwong/profile/service/news/fetcher/FetchedArticle.java
package com.jackwong.profile.service.news.fetcher;

import java.time.Instant;

/**
 * One item read from an upstream source, before persistence and enrichment.
 *
 * @param title       headline
 * @param url         absolute article URL
 * @param author      byline, may be {@code null}
 * @param publishedAt publication instant, may be {@code null} when the source omits it
 * @param excerpt     summary or teaser text supplied by the source, may be {@code null}
 */
public record FetchedArticle(String title, String url, String author, Instant publishedAt, String excerpt) {
}
