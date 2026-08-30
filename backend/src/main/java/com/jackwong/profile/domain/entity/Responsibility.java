// backend/src/main/java/com/jackwong/profile/domain/entity/Responsibility.java
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single duty / achievement bullet underneath a {@link JobPosition}.
 */
@Entity
@Table(name = "responsibility")
@Getter
@Setter
@NoArgsConstructor
public class Responsibility extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition position;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "content_i18n", nullable = false, columnDefinition = "TEXT")
    private LocalizedText content;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
