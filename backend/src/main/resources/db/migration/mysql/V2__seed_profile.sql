-- backend/src/main/resources/db/migration/mysql/V2__seed_profile.sql
-- Seed the default (single) profile aggregate so the public site renders immediately
-- after a clean bootstrap. All localised text columns hold a JSON document with the
-- shape {"en": "...", "zhHant": "...", "zhHans": "..."}.

INSERT INTO profile (slug, full_name, full_name_i18n, headline_i18n, job_title_i18n, company_name, location,
                     summary_i18n, avatar_url, email, phone, facebook_url, instagram_url, xiaohongshu_url,
                     linkedin_url, github_url, website_url, published, optlock_version, created_at, updated_at)
VALUES ('jack-wong',
        'Jack Wong',
        '{"en":"Jack Wong","zhHant":"黃杰克","zhHans":"黄杰克"}',
        '{"en":"Building reliable enterprise systems, end to end.","zhHant":"打造可靠的企業級系統，端到端交付。","zhHans":"打造可靠的企业级系统，端到端交付。"}',
        '{"en":"Senior Full-Stack Engineer","zhHant":"資深全端工程師","zhHans":"资深全栈工程师"}',
        'Acme Technology',
        'Hong Kong',
        '{"en":"I design and ship enterprise-grade platforms across the whole stack — Spring Boot services, relational data models, and modern TypeScript front-ends.\n\n- 10+ years delivering production systems in finance and logistics\n- Domain-driven design, layered architecture, contract-first APIs\n- Strong focus on observability, testing, and developer experience","zhHant":"我專注於全端企業級平台的設計與交付 —— 包含 Spring Boot 服務、關聯式資料模型，以及現代化的 TypeScript 前端。\n\n- 十年以上金融與物流領域的正式系統交付經驗\n- 領域驅動設計、分層架構、合約優先的 API 設計\n- 重視可觀測性、測試與開發者體驗","zhHans":"我专注于全栈企业级平台的设计与交付 —— 包含 Spring Boot 服务、关系型数据模型，以及现代化的 TypeScript 前端。\n\n- 十年以上金融与物流领域的正式系统交付经验\n- 领域驱动设计、分层架构、合约优先的 API 设计\n- 重视可观测性、测试与开发者体验"}',
        NULL,
        'jack.wong@example.com',
        '+852 5555 0100',
        'https://www.facebook.com/',
        'https://www.instagram.com/',
        'https://www.xiaohongshu.com/',
        'https://www.linkedin.com/',
        'https://github.com/',
        'https://example.com',
        1, 0, NOW(6), NOW(6));

SET @profile_id = LAST_INSERT_ID();

INSERT INTO experience (profile_id, company_name, company_url, location, employment_type, start_date, end_date,
                        current_role_flg, description_i18n, display_order, created_at, updated_at)
VALUES (@profile_id, 'Acme Technology', 'https://example.com', 'Hong Kong', 'FULL_TIME', '2020-03-01', NULL, 1,
        '{"en":"Enterprise platform group delivering trading and settlement systems.","zhHant":"負責交易與結算系統的企業平台團隊。","zhHans":"负责交易与结算系统的企业平台团队。"}',
        0, NOW(6), NOW(6));

SET @exp_acme = LAST_INSERT_ID();

INSERT INTO job_position (experience_id, title_i18n, employment_type, start_date, end_date, current_role_flg,
                          display_order, created_at, updated_at)
VALUES (@exp_acme,
        '{"en":"Principal Engineer","zhHant":"首席工程師","zhHans":"首席工程师"}',
        'FULL_TIME', '2023-01-01', NULL, 1, 0, NOW(6), NOW(6));

SET @pos_principal = LAST_INSERT_ID();

INSERT INTO responsibility (position_id, content_i18n, display_order, created_at, updated_at)
VALUES (@pos_principal,
        '{"en":"Own the technical roadmap for a 40-service Spring Boot estate serving 3M daily requests.","zhHant":"主導 40 個 Spring Boot 服務的技術藍圖，每日處理 300 萬次請求。","zhHans":"主导 40 个 Spring Boot 服务的技术蓝图，每日处理 300 万次请求。"}',
        0, NOW(6), NOW(6)),
       (@pos_principal,
        '{"en":"Introduced contract-first API governance, cutting cross-team integration defects by 62%.","zhHant":"導入合約優先的 API 治理流程，跨團隊整合缺陷下降 62%。","zhHans":"导入合约优先的 API 治理流程，跨团队集成缺陷下降 62%。"}',
        1, NOW(6), NOW(6));

INSERT INTO job_position (experience_id, title_i18n, employment_type, start_date, end_date, current_role_flg,
                          display_order, created_at, updated_at)
VALUES (@exp_acme,
        '{"en":"Senior Software Engineer","zhHant":"資深軟體工程師","zhHans":"资深软件工程师"}',
        'FULL_TIME', '2020-03-01', '2022-12-31', 0, 1, NOW(6), NOW(6));

SET @pos_senior = LAST_INSERT_ID();

INSERT INTO responsibility (position_id, content_i18n, display_order, created_at, updated_at)
VALUES (@pos_senior,
        '{"en":"Rebuilt the settlement engine on Spring Boot 3 and MySQL, halving end-of-day batch time.","zhHant":"以 Spring Boot 3 與 MySQL 重構結算引擎，日終批次時間減半。","zhHans":"以 Spring Boot 3 与 MySQL 重构结算引擎，日终批次时间减半。"}',
        0, NOW(6), NOW(6)),
       (@pos_senior,
        '{"en":"Led the migration from monolithic JSP screens to a typed Next.js front-end.","zhHant":"主導由單體 JSP 畫面遷移至型別完整的 Next.js 前端。","zhHans":"主导由单体 JSP 页面迁移至类型完整的 Next.js 前端。"}',
        1, NOW(6), NOW(6));

INSERT INTO education (profile_id, institution, institution_i18n, degree_i18n, field_of_study_i18n, location,
                       start_date, end_date, grade, description_i18n, display_order, created_at, updated_at)
VALUES (@profile_id, 'The University of Hong Kong',
        '{"en":"The University of Hong Kong","zhHant":"香港大學","zhHans":"香港大学"}',
        '{"en":"BSc (Hons) Computer Science","zhHant":"計算機科學 理學士（榮譽）","zhHans":"计算机科学 理学士（荣誉）"}',
        '{"en":"Computer Science","zhHant":"計算機科學","zhHans":"计算机科学"}',
        'Hong Kong', '2011-09-01', '2015-06-30', 'First Class Honours',
        '{"en":"Final-year project on distributed transaction recovery.","zhHant":"畢業專題：分散式交易復原機制。","zhHans":"毕业专题：分布式事务恢复机制。"}',
        0, NOW(6), NOW(6));

INSERT INTO certification (profile_id, name_i18n, issuing_organization, issue_date, expiration_date, credential_id,
                           credential_url, description_i18n, display_order, created_at, updated_at)
VALUES (@profile_id,
        '{"en":"AWS Certified Solutions Architect – Professional","zhHant":"AWS 認證解決方案架構師 – 專業級","zhHans":"AWS 认证解决方案架构师 – 专业级"}',
        'Amazon Web Services', '2023-05-12', '2026-05-12', 'AWS-PSA-2023-0512',
        'https://aws.amazon.com/verification',
        '{"en":"Professional-level cloud architecture certification.","zhHant":"專業級雲端架構認證。","zhHans":"专业级云端架构认证。"}',
        0, NOW(6), NOW(6));
