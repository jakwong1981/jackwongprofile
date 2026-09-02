#!/bin/bash

# Quick Test Data Script for Layout Testing
# Simple one-command solution

echo "🎯 Quick Test Data Setup"
echo "========================"

# Check if we can run MySQL commands
if docker-compose -f docker-compose.sit.yml ps | grep -q "mysql.*Up"; then
    echo "✅ MySQL is running"
    
    # Create and execute simple test data
    cat << 'SQL' | docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"RootPass123!" jackwong_profile
USE jackwong_profile;

-- Simple test profile
INSERT INTO profile (id, created_at, updated_at, slug, full_name, full_name_i18n, headline_i18n, job_title_i18n, 
                     company_name, location, summary_i18n, avatar_url, email, phone, published, optlock_version) 
VALUES (99, NOW(), NOW(), 'layout-test', 'Layout Test User', 
        '{"en":"Layout Test User", "zhHant":"佈局測試用戶", "zhHans":"布局测试用户"}',
        '{"en":"Test Profile for Layout Verification", "zhHant":"用於佈局驗證的測試檔案", "zhHans":"用于布局验证的测试档案"}',
        '{"en":"Software Developer", "zhHant":"軟件開發者", "zhHans":"软件开发者"}',
        'Test Company', 'Test Location',
        '{"en":"This is a test profile to verify the layout of the profile management system.", "zhHant":"這是一個測試檔案，用於驗證個人檔案管理系統的佈局。", "zhHans":"这是一个测试档案，用于验证个人档案管理系统的布局。"}',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'test@example.com', '+852 1234 5678', TRUE, 1)
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    full_name_i18n = VALUES(full_name_i18n),
    headline_i18n = VALUES(headline_i18n);

-- Add one experience
INSERT INTO experience (id, created_at, updated_at, profile_id, company_name, location, display_order)
VALUES (99, NOW(), NOW(), 99, 'Test Experience Ltd.', 'Test City', 1)
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

-- Add one job position
INSERT INTO job_position (id, created_at, updated_at, experience_id, job_title, start_date, current_job, display_order)
VALUES (99, NOW(), NOW(), 99, '{"en":"Test Developer", "zhHant":"測試開發者", "zhHans":"测试开发者"}', '2023-01-01', TRUE, 1)
ON DUPLICATE KEY UPDATE job_title = VALUES(job_title);

-- Add one responsibility
INSERT INTO responsibility (id, created_at, updated_at, job_position_id, responsibility_text, display_order)
VALUES (99, NOW(), NOW(), 99, '{"en":"Testing the layout and functionality of the profile system.", "zhHant":"測試個人檔案系統的佈局和功能。", "zhHans":"测试个人档案系统的布局和功能。"}', 1)
ON DUPLICATE KEY UPDATE responsibility_text = VALUES(responsibility_text);

-- Add one education
INSERT INTO education (id, created_at, updated_at, profile_id, institution_name, degree_name, field_of_study, start_date, end_date, display_order)
VALUES (99, NOW(), NOW(), 99, 'Test University', '{"en":"Test Degree", "zhHant":"測試學位", "zhHans":"测试学位"}', '{"en":"Test Field", "zhHant":"測試領域", "zhHans":"测试领域"}', '2018-09-01', '2022-06-30', 1)
ON DUPLICATE KEY UPDATE institution_name = VALUES(institution_name);

-- Add one certification
INSERT INTO certification (id, created_at, updated_at, profile_id, certification_name, issuing_organization, issue_date, display_order)
VALUES (99, NOW(), NOW(), 99, '{"en":"Test Certification", "zhHant":"測試認證", "zhHans":"测试认证"}', 'Test Organization', '2023-06-01', 1)
ON DUPLICATE KEY UPDATE certification_name = VALUES(certification_name);

-- Add one news article
INSERT INTO news_article (id, created_at, updated_at, source, title, summary, url, published_date, category)
VALUES (99, NOW(), NOW(), 'TECHCRUNCH', '{"en":"Test News Article for Layout", "zhHant":"用於佈局的測試新聞文章", "zhHans":"用于布局的测试新闻文章"}',
        '{"en":"This is a test news article to verify the news layout functionality.", "zhHant":"這是一篇測試新聞文章，用於驗證新聞佈局功能。", "zhHans":"这是一篇测试新闻文章，用于验证新闻布局功能。"}',
        'https://example.com/test-news', '2024-03-15 12:00:00', 'TECHNOLOGY')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Show what we inserted
SELECT '🎯 Test Data Summary' as message;
SELECT 'Profile ID: 99' as item, 'Test User' as value
UNION ALL
SELECT 'API Test URL', 'http://localhost:8080/api/v1/public/profile'
UNION ALL
SELECT 'Frontend Test URL', 'http://localhost:3000'
UNION ALL
SELECT 'Admin Login', 'http://localhost:3000/admin/login';

SQL

    echo ""
    echo "✅ Test data inserted successfully!"
    echo ""
    echo "📊 You can now test the layout at:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • API Data: http://localhost:8080/api/v1/public/profile"
    echo "   • Admin Panel: http://localhost:3000/admin/login"
    echo ""
    echo "🔧 Test Credentials:"
    echo "   Username: system-admin"
    echo "   Password: SecureAdminPass2024!"
    
else
    echo "❌ MySQL is not running"
    echo ""
    echo "💡 Start the SIT environment first:"
    echo "   ./scripts/deploy-sit.sh"
    echo "   or"
    echo "   docker-compose -f docker-compose.sit.yml up -d mysql backend frontend"
fi
