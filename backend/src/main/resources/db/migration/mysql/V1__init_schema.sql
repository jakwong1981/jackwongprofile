-- backend/src/main/resources/db/migration/mysql/V1__init_schema.sql
-- Baseline schema for the dynamic personal profile management system (MySQL 8.x).
-- Flyway is the single source of truth for the schema; Hibernate never generates DDL.

CREATE TABLE profile
(
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(64)  NOT NULL,
    full_name       VARCHAR(120) NOT NULL,
    full_name_i18n  TEXT         NULL,
    headline_i18n   TEXT         NULL,
    job_title_i18n  TEXT         NULL,
    company_name    VARCHAR(160) NULL,
    location        VARCHAR(160) NULL,
    summary_i18n    TEXT         NULL,
    avatar_url      VARCHAR(512) NULL,
    email           VARCHAR(190) NULL,
    phone           VARCHAR(40)  NULL,
    facebook_url    VARCHAR(512) NULL,
    instagram_url   VARCHAR(512) NULL,
    xiaohongshu_url VARCHAR(512) NULL,
    linkedin_url    VARCHAR(512) NULL,
    github_url      VARCHAR(512) NULL,
    website_url     VARCHAR(512) NULL,
    published       TINYINT(1)   NOT NULL DEFAULT 1,
    optlock_version BIGINT       NOT NULL DEFAULT 0,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_profile_slug (slug)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE experience
(
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    profile_id       BIGINT       NOT NULL,
    company_name     VARCHAR(160) NOT NULL,
    company_url      VARCHAR(512) NULL,
    logo_url         VARCHAR(512) NULL,
    location         VARCHAR(160) NULL,
    employment_type  VARCHAR(40)  NULL,
    start_date       DATE         NOT NULL,
    end_date         DATE         NULL,
    current_role_flg TINYINT(1)   NOT NULL DEFAULT 0,
    description_i18n TEXT         NULL,
    display_order    INT          NOT NULL DEFAULT 0,
    created_at       DATETIME(6)  NOT NULL,
    updated_at       DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_experience_profile (profile_id, display_order),
    CONSTRAINT fk_experience_profile FOREIGN KEY (profile_id) REFERENCES profile (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE job_position
(
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    experience_id    BIGINT      NOT NULL,
    title_i18n       TEXT        NOT NULL,
    employment_type  VARCHAR(40) NULL,
    start_date       DATE        NOT NULL,
    end_date         DATE        NULL,
    current_role_flg TINYINT(1)  NOT NULL DEFAULT 0,
    display_order    INT         NOT NULL DEFAULT 0,
    created_at       DATETIME(6) NOT NULL,
    updated_at       DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_position_experience (experience_id, display_order),
    CONSTRAINT fk_position_experience FOREIGN KEY (experience_id) REFERENCES experience (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE responsibility
(
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    position_id   BIGINT      NOT NULL,
    content_i18n  TEXT        NOT NULL,
    display_order INT         NOT NULL DEFAULT 0,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_responsibility_position (position_id, display_order),
    CONSTRAINT fk_responsibility_position FOREIGN KEY (position_id) REFERENCES job_position (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE education
(
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    profile_id           BIGINT       NOT NULL,
    institution          VARCHAR(200) NOT NULL,
    institution_i18n     TEXT         NULL,
    degree_i18n          TEXT         NULL,
    field_of_study_i18n  TEXT         NULL,
    location             VARCHAR(160) NULL,
    start_date           DATE         NULL,
    end_date             DATE         NULL,
    grade                VARCHAR(60)  NULL,
    credential_id        VARCHAR(120) NULL,
    credential_url       VARCHAR(512) NULL,
    description_i18n     TEXT         NULL,
    display_order        INT          NOT NULL DEFAULT 0,
    created_at           DATETIME(6)  NOT NULL,
    updated_at           DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_education_profile (profile_id, display_order),
    CONSTRAINT fk_education_profile FOREIGN KEY (profile_id) REFERENCES profile (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE certification
(
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    profile_id           BIGINT       NOT NULL,
    name_i18n            TEXT         NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    issue_date           DATE         NULL,
    expiration_date      DATE         NULL,
    credential_id        VARCHAR(120) NULL,
    credential_url       VARCHAR(512) NULL,
    description_i18n     TEXT         NULL,
    display_order        INT          NOT NULL DEFAULT 0,
    created_at           DATETIME(6)  NOT NULL,
    updated_at           DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_certification_profile (profile_id, display_order),
    CONSTRAINT fk_certification_profile FOREIGN KEY (profile_id) REFERENCES profile (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE admin_user
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL,
    password_hash VARCHAR(120) NOT NULL,
    display_name  VARCHAR(120) NULL,
    role          VARCHAR(32)  NOT NULL DEFAULT 'ROLE_ADMIN',
    enabled       TINYINT(1)   NOT NULL DEFAULT 1,
    last_login_at DATETIME(6)  NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_user_username (username)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE news_article
(
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    source_key      VARCHAR(40)   NOT NULL,
    source_name     VARCHAR(120)  NOT NULL,
    external_id     CHAR(64)      NOT NULL,
    title           VARCHAR(512)  NOT NULL,
    url             VARCHAR(1024) NOT NULL,
    author          VARCHAR(160)  NULL,
    published_at    DATETIME(6)   NULL,
    excerpt         TEXT          NULL,
    summary         TEXT          NULL,
    key_points      TEXT          NULL,
    keywords        TEXT          NULL,
    category        VARCHAR(60)   NULL,
    impact_level    VARCHAR(20)   NULL,
    language        VARCHAR(12)   NULL,
    analysis_status VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    analysis_error  VARCHAR(512)  NULL,
    fetched_at      DATETIME(6)   NOT NULL,
    analyzed_at     DATETIME(6)   NULL,
    created_at      DATETIME(6)   NOT NULL,
    updated_at      DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_news_external_id (external_id),
    KEY idx_news_published_at (published_at DESC),
    KEY idx_news_source_published (source_key, published_at DESC),
    KEY idx_news_analysis_status (analysis_status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE news_ingestion_run
(
    id             BIGINT      NOT NULL AUTO_INCREMENT,
    started_at     DATETIME(6) NOT NULL,
    finished_at    DATETIME(6) NULL,
    status         VARCHAR(20) NOT NULL,
    source_count   INT         NOT NULL DEFAULT 0,
    fetched_count  INT         NOT NULL DEFAULT 0,
    created_count  INT         NOT NULL DEFAULT 0,
    analyzed_count INT         NOT NULL DEFAULT 0,
    failed_count   INT         NOT NULL DEFAULT 0,
    triggered_by   VARCHAR(60) NULL,
    message        TEXT        NULL,
    PRIMARY KEY (id),
    KEY idx_ingestion_started_at (started_at DESC)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
