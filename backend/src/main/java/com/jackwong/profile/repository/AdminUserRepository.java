// backend/src/main/java/com/jackwong/profile/repository/AdminUserRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.AdminUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for administrative accounts.
 */
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);
}
