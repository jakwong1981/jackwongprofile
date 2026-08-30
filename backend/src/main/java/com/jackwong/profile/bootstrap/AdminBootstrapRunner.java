// backend/src/main/java/com/jackwong/profile/bootstrap/AdminBootstrapRunner.java
package com.jackwong.profile.bootstrap;

import com.jackwong.profile.config.SecurityProperties;
import com.jackwong.profile.domain.entity.AdminUser;
import com.jackwong.profile.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Provisions the first administrator so a fresh deployment is immediately manageable.
 * The account is created only when the table is empty; existing passwords are never touched.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {

    private final SecurityProperties securityProperties;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void run(ApplicationArguments args) {
        SecurityProperties.Bootstrap bootstrap = securityProperties.bootstrap();
        if (bootstrap == null || !bootstrap.enabled()) {
            log.debug("Administrator bootstrap is disabled");
            return;
        }
        if (adminUserRepository.count() > 0) {
            log.debug("Administrator accounts already exist; skipping bootstrap");
            return;
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(bootstrap.username());
        adminUser.setPasswordHash(passwordEncoder.encode(bootstrap.password()));
        adminUser.setDisplayName(bootstrap.displayName());
        adminUser.setRole(AdminUser.ROLE_ADMIN);
        adminUser.setEnabled(true);
        adminUserRepository.save(adminUser);

        log.warn("Bootstrapped administrator '{}'. Change the password immediately.", bootstrap.username());
    }
}
