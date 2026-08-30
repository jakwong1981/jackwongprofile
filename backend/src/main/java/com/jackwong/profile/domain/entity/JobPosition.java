// backend/src/main/java/com/jackwong/profile/domain/entity/JobPosition.java
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
 * A job title held at one employer, owning its itemised {@link Responsibility} bullets.
 */
@Entity
@Table(name = "job_position")
@Getter
@Setter
@NoArgsConstructor
public class JobPosition extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "experience_id", nullable = false)
    private Experience experience;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "title_i18n", nullable = false, columnDefinition = "TEXT")
    private LocalizedText title;

    @Column(name = "employment_type", length = 40)
    private String employmentType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "current_role_flg", nullable = false)
    private boolean currentRole;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<Responsibility> responsibilities = new ArrayList<>();

    public void addResponsibility(Responsibility responsibility) {
        responsibility.setPosition(this);
        responsibilities.add(responsibility);
    }

    public void clearResponsibilities() {
        responsibilities.forEach(responsibility -> responsibility.setPosition(null));
        responsibilities.clear();
    }
}
