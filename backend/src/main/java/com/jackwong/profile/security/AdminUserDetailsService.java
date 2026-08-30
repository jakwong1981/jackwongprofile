// backend/src/main/java/com/jackwong/profile/security/AdminUserDetailsService.java
package com.jackwong.profile.security;

import com.jackwong.profile.domain.entity.AdminUser;
import com.jackwong.profile.repository.AdminUserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bridges the {@link AdminUser} table into Spring Security.
 */
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true, rollbackFor = Exception.class)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Unknown administrator"));
        return User.withUsername(adminUser.getUsername())
                .password(adminUser.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(adminUser.getRole())))
                .disabled(!adminUser.isEnabled())
                .build();
    }
}
