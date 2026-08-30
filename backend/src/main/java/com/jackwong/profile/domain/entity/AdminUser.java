// backend/src/main/java/com/jackwong/profile/domain/entity/AdminUser.java
package com.jackwong.profile.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Operator account allowed to sign in to the administrative dashboard.
 */
@Entity
@Table(name = "admin_user")
@Getter
@Setter
@NoArgsConstructor
public class AdminUser extends AuditableEntity {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    @Column(name = "username", nullable = false, length = 64)
    private String username;

    /** BCrypt hash; the plain password never leaves the request thread. */
    @Column(name = "password_hash", nullable = false, length = 120)
    private String passwordHash;

    @Column(name = "display_name", length = 120)
    private String displayName;

    @Column(name = "role", nullable = false, length = 32)
    private String role = ROLE_ADMIN;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
