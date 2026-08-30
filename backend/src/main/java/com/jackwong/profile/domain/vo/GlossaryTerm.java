// backend/src/main/java/com/jackwong/profile/domain/vo/GlossaryTerm.java
package com.jackwong.profile.domain.vo;

/**
 * A domain term extracted from an article together with a plain-language definition.
 *
 * @param term       the keyword or acronym as it appeared in the article
 * @param definition short, jargon-free explanation produced by the analysis model
 */
public record GlossaryTerm(String term, String definition) {
}
