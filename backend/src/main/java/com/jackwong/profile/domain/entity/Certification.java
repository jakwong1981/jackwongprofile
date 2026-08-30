// backend/src/main/java/com/jackwong/profile/domain/entity/Certification.java
package com.jackwong.profile.domain.entity;

import com.jackwong.profile.domain.converter.LocalizedTextConverter;
import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A professional credential with issuer metadata and optional verification link.
 */
@Entity
@Table(name = "certification")
@Getter
@Setter
@NoArgsConstructor
public class Certification extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "name_i18n", nullable = false, columnDefinition = "TEXT")
    private LocalizedText name;

    @Column(name = "issuing_organization", nullable = false, length = 200)
    private String issuingOrganization;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "credential_id", length = 120)
    private String credentialId;

    @Column(name = "credential_url", length = 512)
    private String credentialUrl;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "description_i18n", columnDefinition = "TEXT")
    private LocalizedText description;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
