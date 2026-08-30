// backend/src/main/java/com/jackwong/profile/ProfileServiceApplication.java
package com.jackwong.profile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the personal profile management REST service.
 */
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.jackwong.profile")
@EnableJpaAuditing
@EnableScheduling
public class ProfileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfileServiceApplication.class, args);
    }
}
