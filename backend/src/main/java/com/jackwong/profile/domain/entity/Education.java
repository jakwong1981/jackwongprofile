// backend/src/main/java/com/jackwong/profile/domain/entity/Education.java
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
 * One academic record (degree, diploma, or programme) attached to the profile.
 */
@Entity
@Table(name = "education")
@Getter
@Setter
@NoArgsConstructor
public class Education extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "institution", nullable = false, length = 200)
    private String institution;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "institution_i18n", columnDefinition = "TEXT")
    private LocalizedText localizedInstitution;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "degree_i18n", columnDefinition = "TEXT")
    private LocalizedText degree;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "field_of_study_i18n", columnDefinition = "TEXT")
    private LocalizedText fieldOfStudy;

    @Column(name = "location", length = 160)
    private String location;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "grade", length = 60)
    private String grade;

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
