// backend/src/main/java/com/jackwong/profile/domain/entity/Experience.java
package com.jackwong.profile.domain.entity;

import com.jackwong.profile.domain.converter.LocalizedTextConverter;
import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One employer. A single employer may hold several {@link JobPosition} rows so that a
 * promotion history renders as nested entries in resume format.
 */
@Entity
@Table(name = "experience")
@Getter
@Setter
@NoArgsConstructor
public class Experience extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "company_name", nullable = false, length = 160)
    private String companyName;

    @Column(name = "company_url", length = 512)
    private String companyUrl;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "location", length = 160)
    private String location;

    @Column(name = "employment_type", length = 40)
    private String employmentType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "current_role_flg", nullable = false)
    private boolean currentRole;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "description_i18n", columnDefinition = "TEXT")
    private LocalizedText description;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, startDate DESC")
    private List<JobPosition> positions = new ArrayList<>();

    public void addPosition(JobPosition position) {
        position.setExperience(this);
        positions.add(position);
    }

    public void removePosition(JobPosition position) {
        positions.remove(position);
        position.setExperience(null);
    }
}
