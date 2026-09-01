#!/bin/bash

# Dummy Data Insertion Script for Jack Wong Profile System
# This script inserts comprehensive test data for layout testing and development

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📊 Starting Dummy Data Insertion for Jack Wong Profile System"
echo "============================================================"
echo ""

# Check if MySQL container is running
if ! docker-compose -f docker-compose.sit.yml ps | grep -q "mysql.*Up"; then
    echo "❌ MySQL container is not running. Please start the SIT environment first:"
    echo "   docker-compose -f docker-compose.sit.yml up -d mysql backend"
    echo "   or ./scripts/deploy-sit.sh"
    exit 1
fi

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
MAX_WAIT=30
WAITED=0
while ! docker-compose -f docker-compose.sit.yml exec -T mysql mysqladmin ping -h"127.0.0.1" -uroot -p"RootPass123!" --silent 2>/dev/null; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ MySQL did not become ready within $MAX_WAIT seconds"
        exit 1
    fi
    echo -n "."
done
echo ""
echo "✅ MySQL is ready"

# Create the SQL file with dummy data
DUMMY_SQL_FILE="$PROJECT_ROOT/scripts/dummy-data.sql"
echo "📝 Creating dummy data SQL file..."

cat > "$DUMMY_SQL_FILE" << 'SQL_EOF'
-- Dummy Data for Jack Wong Profile System
-- Comprehensive test data for layout testing and development

USE jackwong_profile;

-- Clean existing data (optional - comment out to keep existing data)
-- TRUNCATE TABLE responsibility;
-- TRUNCATE TABLE job_position;
-- TRUNCATE TABLE experience;
-- TRUNCATE TABLE education;
-- TRUNCATE TABLE certification;
-- TRUNCATE TABLE profile;
-- TRUNCATE TABLE admin_user;
-- TRUNCATE TABLE news_article;
-- TRUNCATE TABLE news_ingestion_run;

-- Insert Admin User
INSERT INTO admin_user (id, created_at, updated_at, username, password_hash, enabled, role) VALUES
(1, NOW(), NOW(), 'admin', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRST', TRUE, 'ROLE_ADMIN'),
(2, NOW(), NOW(), 'editor', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRST', TRUE, 'ROLE_EDITOR');

-- Insert Main Profile
INSERT INTO profile (id, created_at, updated_at, slug, full_name, full_name_i18n, headline_i18n, job_title_i18n, 
                     company_name, location, summary_i18n, avatar_url, email, phone, facebook_url, instagram_url, 
                     xiaohongshu_url, linkedin_url, github_url, website_url, published, optlock_version) VALUES
(1, NOW(), NOW(), 'jack-wong', 'Jack Wong', 
'{"en":"Jack Wong", "zhHant":"黃傑克", "zhHans":"黄杰克"}',
'{"en":"Senior Full Stack Developer & AI Specialist", "zhHant":"資深全端開發工程師與人工智能專家", "zhHans":"资深全端开发工程师与人工智能专家"}',
'{"en":"Lead Software Engineer", "zhHant":"首席軟件工程師", "zhHans":"首席软件工程师"}',
'BytePlus Technology', 'Hong Kong, China',
'{"en":"# Senior Full Stack Developer with 8+ Years Experience\n\nPassionate about building scalable web applications and AI-powered solutions. Experienced in Java, TypeScript, React, and cloud technologies.\n\n## Key Skills\n- **Backend**: Java/Spring Boot, Node.js, Python\n- **Frontend**: React, Next.js, TypeScript, Tailwind CSS\n- **Database**: MySQL, PostgreSQL, MongoDB\n- **DevOps**: Docker, Kubernetes, AWS, CI/CD\n- **AI/ML**: LLM integration, DeepSeek API, News aggregation\n\n## Open Source Contributions\nActive contributor to various open source projects with focus on developer tools and web frameworks.", "zhHant":"# 資深全端開發工程師，8年以上經驗\n\n熱衷於構建可擴展的網頁應用程式和人工智能解決方案。熟悉Java、TypeScript、React和雲端技術。\n\n## 主要技能\n- **後端**: Java/Spring Boot、Node.js、Python\n- **前端**: React、Next.js、TypeScript、Tailwind CSS\n- **數據庫**: MySQL、PostgreSQL、MongoDB\n- **DevOps**: Docker、Kubernetes、AWS、CI/CD\n- **人工智能**: 大型語言模型集成、DeepSeek API、新聞聚合\n\n## 開源貢獻\n積極參與多個開源項目，專注於開發者工具和網頁框架。", "zhHans":"# 资深全端开发工程师，8年以上经验\n\n热衷于构建可扩展的网页应用程序和人工智能解决方案。熟悉Java、TypeScript、React和云端技术。\n\n## 主要技能\n- **后端**: Java/Spring Boot、Node.js、Python\n- **前端**: React、Next.js、TypeScript、Tailwind CSS\n- **数据库**: MySQL、PostgreSQL、MongoDB\n- **DevOps**: Docker、Kubernetes、AWS、CI/CD\n- **人工智能**: 大型语言模型集成、DeepSeek API、新闻聚合\n\n## 开源贡献\n积极参与多个开源项目，专注于开发者工具和网页框架。"}',
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
'jack.wong@example.com', '+852 9876 5432',
'https://facebook.com/jackwong', 'https://instagram.com/jackwong',
'https://xiaohongshu.com/user/jackwong', 'https://linkedin.com/in/jackwong',
'https://github.com/jackwong', 'https://jackwong.dev',
TRUE, 1);

-- Insert Work Experiences
INSERT INTO experience (id, created_at, updated_at, profile_id, company_name, company_url, logo_url, location, employment_type, display_order) VALUES
(1, NOW(), NOW(), 1, 'BytePlus Technology', 'https://byteplus.com', 'https://logo.clearbit.com/byteplus.com', 'Hong Kong, China', 'FULL_TIME', 1),
(2, NOW(), NOW(), 1, 'AI Research Lab', 'https://airesearchlab.com', 'https://logo.clearbit.com/airesearchlab.com', 'San Francisco, USA', 'CONTRACT', 2),
(3, NOW(), NOW(), 1, 'StartUpTech Inc.', 'https://startuptech.com', 'https://logo.clearbit.com/startuptech.com', 'Singapore', 'FULL_TIME', 3),
(4, NOW(), NOW(), 1, 'University of Technology', 'https://unitech.edu', 'https://logo.clearbit.com/unitech.edu', 'London, UK', 'INTERNSHIP', 4);

-- Insert Job Positions for each experience
INSERT INTO job_position (id, created_at, updated_at, experience_id, job_title, start_date, end_date, current_job, display_order) VALUES
(1, NOW(), NOW(), 1, '{"en":"Lead Software Engineer", "zhHant":"首席軟件工程師", "zhHans":"首席软件工程师"}', '2022-03-01', NULL, TRUE, 1),
(2, NOW(), NOW(), 1, '{"en":"Senior Software Engineer", "zhHant":"高級軟件工程師", "zhHans":"高级软件工程师"}', '2020-08-01', '2022-02-28', FALSE, 2),
(3, NOW(), NOW(), 2, '{"en":"AI Solutions Architect", "zhHant":"人工智能解決方案架構師", "zhHans":"人工智能解决方案架构师"}', '2021-01-01', '2023-12-31', FALSE, 1),
(4, NOW(), NOW(), 3, '{"en":"Full Stack Developer", "zhHant":"全端開發工程師", "zhHans":"全端开发工程师"}', '2018-06-01', '2020-07-31', FALSE, 1),
(5, NOW(), NOW(), 4, '{"en":"Software Engineering Intern", "zhHant":"軟件工程實習生", "zhHans":"软件工程实习生"}', '2017-06-01', '2017-08-31', FALSE, 1);

-- Insert Responsibilities for each job position
INSERT INTO responsibility (id, created_at, updated_at, job_position_id, responsibility_text, display_order) VALUES
(1, NOW(), NOW(), 1, '{"en":"Led a team of 8 developers in building a microservices architecture handling 1M+ daily requests", "zhHant":"領導8人開發團隊構建微服務架構，處理每日100萬+請求", "zhHans":"领导8人开发团队构建微服务架构，处理每日100万+请求"}', 1),
(2, NOW(), NOW(), 1, '{"en":"Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes", "zhHant":"實施CI/CD流水線，將部署時間從2小時縮短至15分鐘", "zhHans":"实施CI/CD流水线，将部署时间从2小时缩短至15分钟"}', 2),
(3, NOW(), NOW(), 1, '{"en":"Architected AI-powered news aggregation system using DeepSeek API", "zhHant":"使用DeepSeek API構建人工智能新聞聚合系統", "zhHans":"使用DeepSeek API构建人工智能新闻聚合系统"}', 3),
(4, NOW(), NOW(), 2, '{"en":"Developed RESTful APIs with Spring Boot handling complex business logic", "zhHant":"使用Spring Boot開發RESTful API處理複雜業務邏輯", "zhHans":"使用Spring Boot开发RESTful API处理复杂业务逻辑"}', 1),
(5, NOW(), NOW(), 2, '{"en":"Optimized database queries reducing response time by 40%", "zhHant":"優化數據庫查詢，減少40%響應時間", "zhHans":"优化数据库查询，减少40%响应时间"}', 2),
(6, NOW(), NOW(), 3, '{"en":"Designed and implemented LLM integration framework for multiple AI models", "zhHant":"設計並實施LLM集成框架，支持多個人工智能模型", "zhHans":"设计并实施LLM集成框架，支持多个人工智能模型"}', 1),
(7, NOW(), NOW(), 3, '{"en":"Created natural language processing pipeline for document analysis", "zhHant":"創建自然語言處理管道進行文件分析", "zhHans":"创建自然语言处理管道进行文件分析"}', 2),
(8, NOW(), NOW(), 4, '{"en":"Built customer-facing web application with React and Node.js", "zhHant":"使用React和Node.js構建面向客戶的網頁應用程式", "zhHans":"使用React和Node.js构建面向客户的网页应用程序"}', 1),
(9, NOW(), NOW(), 4, '{"en":"Implemented real-time notifications using WebSockets", "zhHant":"使用WebSockets實現實時通知功能", "zhHans":"使用WebSockets实现实时通知功能"}', 2),
(10, NOW(), NOW(), 5, '{"en":"Assisted in developing university course management system", "zhHant":"協助開發大學課程管理系統", "zhHans":"协助开发大学课程管理系统"}', 1);

-- Insert Education
INSERT INTO education (id, created_at, updated_at, profile_id, institution_name, institution_url, logo_url, location, degree_name, field_of_study, start_date, end_date, current_study, display_order, grade) VALUES
(1, NOW(), NOW(), 1, 'University of Technology', 'https://unitech.edu', 'https://logo.clearbit.com/unitech.edu', 'London, UK', 
'{"en":"Master of Science", "zhHant":"理學碩士", "zhHans":"理学硕士"}',
'{"en":"Computer Science & Artificial Intelligence", "zhHant":"計算機科學與人工智能", "zhHans":"计算机科学与人工智能"}',
'2015-09-01', '2017-06-30', FALSE, 1,
'{"en":"Distinction (First Class Honors)", "zhHant":"優異成績（一級榮譽）", "zhHans":"优异成绩（一级荣誉）"}'),
(2, NOW(), NOW(), 1, 'Polytechnic University', 'https://polytech.edu', 'https://logo.clearbit.com/polytech.edu', 'Hong Kong, China',
'{"en":"Bachelor of Engineering", "zhHant":"工程學學士", "zhHans":"工程学学士"}',
'{"en":"Software Engineering", "zhHant":"軟件工程", "zhHans":"软件工程"}',
'2011-09-01', '2015-06-30', FALSE, 2,
'{"en":"First Class Honors", "zhHant":"一級榮譽", "zhHans":"一级荣誉"}');

-- Insert Certifications
INSERT INTO certification (id, created_at, updated_at, profile_id, certification_name, issuing_organization, credential_id, issue_date, expiration_date, credential_url, display_order) VALUES
(1, NOW(), NOW(), 1, '{"en":"AWS Certified Solutions Architect - Professional", "zhHant":"AWS認證解決方案架構師 - 專業級", "zhHans":"AWS认证解决方案架构师 - 专业级"}', 'Amazon Web Services', 'AWS-SAP-C01-12345', '2023-03-15', '2026-03-15', 'https://aws.amazon.com/certification', 1),
(2, NOW(), NOW(), 1, '{"en":"Google Professional Cloud Architect", "zhHant":"Google專業雲端架構師", "zhHans":"Google专业云端架构师"}', 'Google Cloud', 'GCP-PCA-67890', '2022-08-20', '2025-08-20', 'https://cloud.google.com/certification', 2),
(3, NOW(), NOW(), 1, '{"en":"Oracle Certified Professional, Java SE 17 Developer", "zhHant":"Oracle認證專業Java SE 17開發人員", "zhHans":"Oracle认证专业Java SE 17开发人员"}', 'Oracle', '1Z0-829-54321', '2023-11-10', NULL, 'https://education.oracle.com', 3),
(4, NOW(), NOW(), 1, '{"en":"Scrum Master Certified (SMC)", "zhHant":"Scrum大師認證", "zhHans":"Scrum大师认证"}', 'Scrum.org', 'SMC-98765', '2021-05-05', NULL, 'https://www.scrum.org', 4);

-- Insert News Articles for testing news aggregation
INSERT INTO news_article (id, created_at, updated_at, source, title, summary, content, url, image_url, published_date, category, author, tags, keywords) VALUES
(1, NOW(), NOW(), 'TECHCRUNCH', '{"en":"AI Revolution: How LLMs Are Transforming Software Development", "zhHant":"人工智能革命：大型語言模型如何改變軟件開發", "zhHans":"人工智能革命：大型语言模型如何改变软件开发"}',
'{"en":"Large Language Models are dramatically changing how developers write code, with tools like GitHub Copilot becoming standard.", "zhHant":"大型語言模型正在徹底改變開發人員編寫代碼的方式，GitHub Copilot等工具已成為標準配置。", "zhHans":"大型语言模型正在彻底改变开发人员编写代码的方式，GitHub Copilot等工具已成为标准配置。"}',
'{"en":"The integration of LLMs into development workflows has increased productivity by 30-50% according to recent studies. Developers report spending less time on boilerplate code and more on creative problem solving.", "zhHant":"根據最近的研究，將大型語言模型集成到開發工作流程中已將生產力提高了30-50%。開發人員報告花在模板代碼上的時間更少，而將更多時間用於創造性問題解決。", "zhHans":"根据最近的研究，将大型语言模型集成到开发工作流程中已将生产力提高了30-50%。开发人员报告花在模板代码上的时间更少，而将更多时间用于创造性问题解决。"}',
'https://techcrunch.com/ai-llm-software-development',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
'2024-03-15 09:30:00', 'TECHNOLOGY', '{"en":"Sarah Chen", "zhHant":"陳莎拉", "zhHans":"陈莎拉"}',
'["AI", "LLM", "Software Development", "Productivity"]',
'["artificial intelligence", "large language models", "coding assistants", "developer tools"]'),
(2, NOW(), NOW(), 'NEWS_RUNDOWN', '{"en":"The Future of Cloud Computing: Edge AI and Serverless Architectures", "zhHant":"雲端計算的未來：邊緣人工智能與無服務器架構", "zhHans":"云端计算的未来：边缘人工智能与无服务器架构"}',
'{"en":"Edge computing combined with AI is creating new possibilities for real-time applications, while serverless architectures continue to gain traction.", "zhHant":"邊緣計算與人工智能的結合為實時應用創造了新的可能性，而無服務器架構繼續獲得關注。", "zhHans":"边缘计算与人工智能的结合为实时应用创造了新的可能性，而无服务器架构继续获得关注。"}',
'{"en":"Companies are increasingly adopting hybrid cloud strategies that combine edge computing for low-latency requirements with centralized cloud services for data processing and storage.", "zhHant":"公司越來越多地採用混合雲策略，將用於低延遲要求的邊緣計算與用於數據處理和存儲的集中式雲端服務相結合。", "zhHans":"公司越来越多地采用混合云策略，将用于低延迟要求的边缘计算与用于数据处理和存储的集中式云端服务相结合。"}',
'https://newsrundown.com/cloud-edge-ai-future',
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w-800&q=80',
'2024-03-14 14:20:00', 'TECHNOLOGY', '{"en":"Michael Rodriguez", "zhHant":"羅德里格斯·邁克爾", "zhHans":"罗德里格斯·迈克尔"}',
'["Cloud Computing", "Edge AI", "Serverless", "Architecture"]',
'["edge computing", "artificial intelligence", "cloud infrastructure", "real-time processing"]'),
(3, NOW(), NOW(), 'TECHCRUNCH', '{"en":"TypeScript 5.4 Brings Significant Performance Improvements", "zhHant":"TypeScript 5.4帶來顯著性能提升", "zhHans":"TypeScript 5.4带来显著性能提升"}',
'{"en":"Microsoft\'s latest TypeScript release includes optimizations that reduce memory usage and improve compilation speed by up to 20%.", "zhHant":"微軟最新的TypeScript版本包括優化，可減少記憶體使用並將編譯速度提高達20%。", "zhHans":"微软最新的TypeScript版本包括优化，可减少内存使用并将编译速度提高达20%。"}',
'{"en":"The TypeScript team focused on improving incremental compilation and reducing the memory footprint for large codebases. Early adopters report significant improvements in developer experience.", "zhHant":"TypeScript團隊專注於改進增量編譯並減少大型代碼庫的記憶體佔用。早期採用者報告開發者體驗有顯著改善。", "zhHans":"TypeScript团队专注于改进增量编译并减少大型代码库的内存占用。早期采用者报告开发者体验有显著改善。"}',
'https://techcrunch.com/typescript-5.4-performance',
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
'2024-03-13 11:45:00', 'PROGRAMMING', '{"en":"David Kim", "zhHant":"金大衛", "zhHans":"金大卫"}',
'["TypeScript", "JavaScript", "Performance", "Microsoft"]',
'["typescript 5.4", "compiler optimization", "developer tools", "web development"]');

-- Insert News Ingestion Run for tracking
INSERT INTO news_ingestion_run (id, created_at, updated_at, started_at, completed_at, total_articles, successful_sources, failed_sources, error_message) VALUES
(1, NOW(), NOW(), '2024-03-15 08:00:00', '2024-03-15 08:15:00', 3, 2, 0, NULL);

-- Reset auto-increment counters to avoid conflicts
ALTER TABLE admin_user AUTO_INCREMENT = 100;
ALTER TABLE profile AUTO_INCREMENT = 100;
ALTER TABLE experience AUTO_INCREMENT = 100;
ALTER TABLE job_position AUTO_INCREMENT = 100;
ALTER TABLE responsibility AUTO_INCREMENT = 100;
ALTER TABLE education AUTO_INCREMENT = 100;
ALTER TABLE certification AUTO_INCREMENT = 100;
ALTER TABLE news_article AUTO_INCREMENT = 100;
ALTER TABLE news_ingestion_run AUTO_INCREMENT = 100;

SQL_EOF

echo "✅ Dummy data SQL file created: $DUMMY_SQL_FILE"

# Execute the SQL file
echo "🚀 Inserting dummy data into database..."
if docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"RootPass123!" jackwong_profile < "$DUMMY_SQL_FILE"; then
    echo "✅ Dummy data inserted successfully!"
else
    echo "❌ Failed to insert dummy data"
    exit 1
fi

# Verify the data was inserted
echo ""
echo "🔍 Verifying inserted data..."
docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"RootPass123!" jackwong_profile -e "
SELECT 
    (SELECT COUNT(*) FROM profile) as profiles,
    (SELECT COUNT(*) FROM experience) as experiences,
    (SELECT COUNT(*) FROM job_position) as job_positions,
    (SELECT COUNT(*) FROM responsibility) as responsibilities,
    (SELECT COUNT(*) FROM education) as educations,
    (SELECT COUNT(*) FROM certification) as certifications,
    (SELECT COUNT(*) FROM news_article) as news_articles,
    (SELECT COUNT(*) FROM admin_user) as admin_users;
"

echo ""
echo "📊 Data Summary:"
echo "----------------"
echo "• Profiles: 1 (Jack Wong)"
echo "• Work Experiences: 4 companies"
echo "• Job Positions: 5 roles"
echo "• Responsibilities: 10 achievements"
echo "• Education: 2 degrees"
echo "• Certifications: 4 professional certifications"
echo "• News Articles: 3 AI/tech news articles"
echo "• Admin Users: 2 (admin, editor)"

echo ""
echo "🎯 Test Data Access:"
echo "--------------------"
echo "1. Frontend: http://localhost:3000"
echo "2. Admin Login: http://localhost:3000/admin/login"
echo "   • Username: admin"
echo "   • Password: ChangeMe123! (use actual admin password)"
echo "3. API Endpoint: http://localhost:8080/api/v1/public/profile"
echo "4. News Feed: http://localhost:3000/news"

echo ""
echo "📝 Data Generation Complete!"
echo "============================"
echo "The database now contains comprehensive dummy data for testing:"
echo ""
echo "👤 Profile includes:"
echo "   • Complete personal information with multilingual support"
echo "   • Professional work history with detailed responsibilities"
echo "   • Educational background with grades and institutions"
echo "   • Professional certifications with issue/expiry dates"
echo "   • Social media links and contact information"
echo ""
echo "📰 News includes:"
echo "   • Recent AI/tech articles with summaries and categories"
echo "   • Multilingual content for testing internationalization"
echo "   • Rich metadata including authors, tags, and keywords"
echo ""
echo "🔧 For database access:"
echo "   mysql -h 127.0.0.1 -P 3306 -u root -p'RootPass123!' jackwong_profile"
echo ""
echo "⚠️  Note: Admin password shown above is for testing only."
echo "    In production, use the actual admin credentials."
