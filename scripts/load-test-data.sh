#!/bin/bash

# Simplified Test Data Loader for Jack Wong Profile System
# This script loads test data for quick layout testing

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🎯 Loading Test Data for Layout Testing"
echo "========================================"
echo ""

# Create test data SQL file
TEST_SQL_FILE="$PROJECT_ROOT/scripts/test-data-simple.sql"

cat > "$TEST_SQL_FILE" << 'SQL_EOF'
-- Simple Test Data for Layout Testing
USE jackwong_profile;

-- Clear existing test data (optional - safe for development)
DELETE FROM responsibility WHERE id < 100;
DELETE FROM job_position WHERE id < 100;
DELETE FROM experience WHERE id < 100;
DELETE FROM education WHERE id < 100;
DELETE FROM certification WHERE id < 100;
DELETE FROM profile WHERE id < 100;
DELETE FROM news_article WHERE id < 100;

-- Insert Test Profile
INSERT INTO profile (id, created_at, updated_at, slug, full_name, full_name_i18n, headline_i18n, job_title_i18n, 
                     company_name, location, summary_i18n, avatar_url, email, phone, published, optlock_version) VALUES
(10, NOW(), NOW(), 'test-user', 'Test User', 
'{"en":"Test User", "zhHant":"測試用戶", "zhHans":"测试用户"}',
'{"en":"Software Developer | AI Enthusiast", "zhHant":"軟件開發者 | 人工智能愛好者", "zhHans":"软件开发者 | 人工智能爱好者"}',
'{"en":"Full Stack Developer", "zhHant":"全端開發者", "zhHans":"全端开发者"}',
'Test Company Ltd.', 'Hong Kong',
'{"en":"Passionate developer with experience in modern web technologies. Enjoys building scalable applications and exploring AI integration.", "zhHant":"熱衷於現代網頁技術的開發者。喜歡構建可擴展的應用程式並探索人工智能集成。", "zhHans":"热衷于现代网页技术的开发者。喜欢构建可扩展的应用程序并探索人工智能集成。"}',
'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
'test@example.com', '+852 1234 5678', TRUE, 1);

-- Insert Test Work Experience
INSERT INTO experience (id, created_at, updated_at, profile_id, company_name, location, display_order) VALUES
(10, NOW(), NOW(), 10, 'Tech Startup Inc.', 'San Francisco, USA', 1),
(11, NOW(), NOW(), 10, 'Enterprise Solutions Co.', 'Hong Kong', 2);

-- Insert Test Job Positions
INSERT INTO job_position (id, created_at, updated_at, experience_id, job_title, start_date, end_date, current_job, display_order) VALUES
(10, NOW(), NOW(), 10, '{"en":"Lead Developer", "zhHant":"首席開發者", "zhHans":"首席开发者"}', '2022-01-01', NULL, TRUE, 1),
(11, NOW(), NOW(), 10, '{"en":"Senior Developer", "zhHant":"高級開發者", "zhHans":"高级开发者"}', '2020-01-01', '2021-12-31', FALSE, 2),
(12, NOW(), NOW(), 11, '{"en":"Software Engineer", "zhHant":"軟件工程師", "zhHans":"软件工程师"}', '2018-06-01', '2019-12-31', FALSE, 1);

-- Insert Test Responsibilities
INSERT INTO responsibility (id, created_at, updated_at, job_position_id, responsibility_text, display_order) VALUES
(10, NOW(), NOW(), 10, '{"en":"Led development of customer-facing web application", "zhHant":"領導面向客戶的網頁應用程式開發", "zhHans":"领导面向客户的网页应用程序开发"}', 1),
(11, NOW(), NOW(), 10, '{"en":"Implemented CI/CD pipeline for automated deployment", "zhHant":"實施自動化部署的CI/CD流水線", "zhHans":"实施自动化部署的CI/CD流水线"}', 2),
(12, NOW(), NOW(), 11, '{"en":"Developed REST APIs for mobile application backend", "zhHant":"為移動應用程式後端開發REST API", "zhHans":"为移动应用程序后端开发REST API"}', 1),
(13, NOW(), NOW(), 12, '{"en":"Worked on database optimization and query performance", "zhHant":"進行數據庫優化和查詢性能改進", "zhHans":"进行数据库优化和查询性能改进"}', 1);

-- Insert Test Education
INSERT INTO education (id, created_at, updated_at, profile_id, institution_name, degree_name, field_of_study, start_date, end_date, display_order) VALUES
(10, NOW(), NOW(), 10, 'University of Technology', '{"en":"Bachelor of Science", "zhHant":"理學士", "zhHans":"理学士"}', '{"en":"Computer Science", "zhHant":"計算機科學", "zhHans":"计算机科学"}', '2014-09-01', '2018-06-30', 1);

-- Insert Test Certifications
INSERT INTO certification (id, created_at, updated_at, profile_id, certification_name, issuing_organization, issue_date, display_order) VALUES
(10, NOW(), NOW(), 10, '{"en":"AWS Certified Developer", "zhHant":"AWS認證開發者", "zhHans":"AWS认证开发者"}', 'Amazon Web Services', '2023-05-01', 1),
(11, NOW(), NOW(), 10, '{"en":"Google Cloud Associate", "zhHant":"Google雲端助理", "zhHans":"Google云端助理"}', 'Google Cloud', '2022-11-01', 2);

-- Insert Test News Articles
INSERT INTO news_article (id, created_at, updated_at, source, title, summary, url, published_date, category) VALUES
(10, NOW(), NOW(), 'TECHCRUNCH', '{"en":"AI Tools Revolutionize Development Workflows", "zhHant":"人工智能工具革命化開發工作流程", "zhHans":"人工智能工具革命化开发工作流程"}', '{"en":"New AI-powered development tools are changing how teams build software.", "zhHant":"新的人工智能開發工具正在改變團隊構建軟件的方式。", "zhHans":"新的人工智能开发工具正在改变团队构建软件的方式。"}', 'https://techcrunch.com/ai-dev-tools', '2024-03-15 10:00:00', 'TECHNOLOGY'),
(11, NOW(), NOW(), 'NEWS_RUNDOWN', '{"en":"The Rise of Edge Computing in Modern Applications", "zhHant":"現代應用中邊緣計算的興起", "zhHans":"现代应用中边缘计算的兴起"}', '{"en":"Edge computing brings processing closer to data sources for faster response times.", "zhHant":"邊緣計算將處理移近數據源以獲得更快的響應時間。", "zhHans":"边缘计算将处理移近数据源以获得更快的响应时间。"}', 'https://newsrundown.com/edge-computing-rise', '2024-03-14 15:30:00', 'TECHNOLOGY');

-- Show summary
SELECT 'Data Summary' as section;
SELECT 
    (SELECT COUNT(*) FROM profile WHERE id = 10) as 'Profile Created',
    (SELECT COUNT(*) FROM experience WHERE profile_id = 10) as 'Experiences',
    (SELECT COUNT(*) FROM job_position WHERE experience_id IN (10,11)) as 'Job Positions',
    (SELECT COUNT(*) FROM responsibility WHERE job_position_id IN (10,11,12)) as 'Responsibilities',
    (SELECT COUNT(*) FROM education WHERE profile_id = 10) as 'Education',
    (SELECT COUNT(*) FROM certification WHERE profile_id = 10) as 'Certifications',
    (SELECT COUNT(*) FROM news_article WHERE id IN (10,11)) as 'News Articles';

SQL_EOF

echo "✅ Test data SQL file created: $TEST_SQL_FILE"
echo ""

# Check if MySQL is accessible
echo "🔍 Checking database connection..."
if command -v mysql &> /dev/null; then
    # Try direct MySQL connection
    if mysql -h 127.0.0.1 -P 3306 -u root -p'RootPass123!' -e "USE jackwong_profile;" &> /dev/null; then
        echo "�� MySQL database accessible"
        echo "📥 Loading test data..."
        
        if mysql -h 127.0.0.1 -P 3306 -u root -p'RootPass123!' jackwong_profile < "$TEST_SQL_FILE"; then
            echo "✅ Test data loaded successfully!"
            
            # Show summary
            echo ""
            echo "📊 Test Data Summary:"
            echo "---------------------"
            echo "• Profile: Test User (test-user)"
            echo "• Work Experiences: 2 companies"
            echo "• Job Positions: 3 roles"
            echo "• Responsibilities: 4 achievements"
            echo "• Education: 1 degree"
            echo "• Certifications: 2 professional certs"
            echo "• News Articles: 2 tech articles"
            
            echo ""
            echo "🌐 Test URLs:"
            echo "-------------"
            echo "Frontend: http://localhost:3000"
            echo "API Data: http://localhost:8080/api/v1/public/profile"
            echo ""
            echo "🎯 Quick Test:"
            echo "curl -s http://localhost:8080/api/v1/public/profile | jq '.data.fullName'"
            
        else
            echo "❌ Failed to load test data"
        fi
    else
        echo "⚠️  Cannot connect to MySQL directly"
        echo "   Trying Docker container method..."
        
        if docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"RootPass123!" jackwong_profile < "$TEST_SQL_FILE" 2>/dev/null; then
            echo "✅ Test data loaded via Docker!"
        else
            echo "❌ Could not load test data"
            echo ""
            echo "💡 Suggestions:"
            echo "1. Start MySQL: docker-compose -f docker-compose.sit.yml up -d mysql"
            echo "2. Check MySQL is running: docker-compose -f docker-compose.sit.yml ps"
            echo "3. Try full deployment: ./scripts/deploy-sit.sh"
        fi
    fi
else
    echo "❌ MySQL client not found. Using Docker method..."
    
    if docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"RootPass123!" jackwong_profile < "$TEST_SQL_FILE" 2>/dev/null; then
        echo "✅ Test data loaded via Docker!"
    else
        echo "❌ Could not load test data via Docker"
    fi
fi

echo ""
echo "📝 Quick Start Guide:"
echo "====================="
echo "1. Start the application:"
echo "   ./scripts/deploy-sit.sh"
echo ""
echo "2. Access the test data:"
echo "   Frontend: http://localhost:3000"
echo "   API: curl http://localhost:8080/api/v1/public/profile"
echo ""
echo "3. Admin access:"
echo "   http://localhost:3000/admin/login"
echo "   Username: admin"
echo "   Password: ChangeMe123!"
echo ""
echo "4. View news:"
echo "   http://localhost:3000/news"
echo ""
echo "⚠️  Note: This test data is for development/testing only."
echo "    It will be cleared when database is reset."
