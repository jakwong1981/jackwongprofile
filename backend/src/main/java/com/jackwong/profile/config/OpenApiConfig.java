// backend/src/main/java/com/jackwong/profile/config/OpenApiConfig.java
package com.jackwong.profile.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Publishes the machine readable API contract consumed by the front-end type generation.
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI profileServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Personal Profile Management API")
                        .description("Public profile delivery, administrative CRUD, and the AI news aggregator.")
                        .version("1.0.0")
                        .contact(new Contact().name("Jack Wong"))
                        .license(new License().name("Proprietary")))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Access token issued by POST /api/v1/auth/login")));
    }
}
