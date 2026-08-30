# DeepSeek API Key Management Guide

## 📋 Quick Reference

### Environment Variable Locations
| Environment | File | Purpose |
|------------|------|---------|
| Local Dev | `.env.local` | Local development testing |
| SIT | `.env.sit` | System Integration Testing |
| Production | `.env.production` | Live production environment |
| Docker | `.env` (root) | Docker Compose deployment |

### Key Rotation Schedule
- **Development**: Every 90 days
- **Staging/SIT**: Every 60 days  
- **Production**: Every 30 days
- **Emergency**: Immediately after exposure

## 🔄 How to Update API Key

### Step-by-Step Process

#### 1. Generate New Key
```bash
# 1. Visit DeepSeek Platform
#    https://platform.deepseek.com/

# 2. Navigate to: Account → API Keys

# 3. Click "Create New API Key"

# 4. Set permissions (minimum required):
#    - chat:completions ✓
#    - models:list ✓

# 5. Copy the new key securely
#    Format: sk-[32+ alphanumeric characters]
```

#### 2. Update Local Configuration
```bash
# Backup old key first
cp .env.sit .env.sit.backup-$(date +%Y%m%d)

# Update key in SIT environment
sed -i '' 's/DEEPSEEK_API_KEY=.*/DEEPSEEK_API_KEY=new-key-here/' .env.sit

# Verify change
grep DEEPSEEK_API_KEY .env.sit
```

#### 3. Deploy Updated Configuration
```bash
# Option A: Using deployment script
./scripts/deploy-sit.sh

# Option B: Manual Docker restart
docker-compose -f docker-compose.sit.yml down
docker-compose -f docker-compose.sit.yml up -d

# Option C: Rebuild with new key
docker-compose -f docker-compose.sit.yml up -d --build
```

#### 4. Test New Key
```bash
# Test backend API connectivity
curl -X POST http://localhost:8080/api/v1/admin/news/analyze \
  -H "Content-Type: application/json" \
  -d '{"articleIds":[1]}'

# Check application logs
docker logs profile-backend --tail=20 | grep -i "deepseek"
```

#### 5. Revoke Old Key
```bash
# 1. Return to DeepSeek Platform
# 2. Find old API key in list
# 3. Click "Revoke" or "Delete"
# 4. Confirm revocation

# Important: Wait 5-10 minutes for revocation to propagate
```

## 🛡️ Security Practices

### DOs and DON'Ts

✅ **DO:**
- Use environment variables
- Rotate keys regularly
- Use different keys per environment
- Monitor API usage
- Implement rate limiting
- Use secret managers for production

❌ **DON'T:**
- Hardcode keys in source files
- Commit keys to version control
- Share keys via email/messaging
- Use same key across environments
- Log keys in application logs
- Store keys in client-side code

### Validation Commands
```bash
# Check if key is exposed in git history
git log -p --all --full-history -- "**/*.env*" "**/*.yml" "**/*.properties" | grep -i "sk-"

# Scan for secrets in codebase
grep -r "sk-" --include="*.java" --include="*.ts" --include="*.js" --include="*.yml" --include="*.yaml" .

# Validate key format
[[ "${DEEPSEEK_API_KEY}" =~ ^sk-[a-zA-Z0-9]{32,}$ ]] && echo "Valid format" || echo "Invalid format"
```

## 🚨 Emergency Procedures

### Suspected Key Exposure

#### Immediate Actions:
```bash
# 1. Stop all services
docker-compose -f docker-compose.sit.yml down

# 2. Revoke compromised key in DeepSeek platform
#    - Login to https://platform.deepseek.com/
#    - Navigate to API Keys
#    - Revoke compromised key

# 3. Generate emergency key
echo "DEEPSEEK_API_KEY=emergency-new-key-here" > .env.sit.emergency
cp .env.sit.emergency .env.sit

# 4. Restart with new key
docker-compose --env-file .env.sit -f docker-compose.sit.yml up -d

# 5. Audit logs for unauthorized access
docker logs profile-backend --since="2h" | grep -E "(401|403|Invalid.*key)"
```

#### Investigation Steps:
1. **Check git history** for accidental commits
2. **Review access logs** for unusual patterns
3. **Monitor API usage** for spikes
4. **Update all related keys** (database, other services)
5. **Notify team** about the incident

## 🔧 Configuration Examples

### Docker Compose Configuration
```yaml
# docker-compose.sit.yml
services:
  backend:
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DEEPSEEK_BASE_URL=${DEEPSEEK_BASE_URL:-https://api.deepseek.com}
    env_file:
      - .env.sit
```

### Spring Boot Configuration
```yaml
# backend/src/main/resources/application.yml
app:
  deepseek:
    api-key: ${DEEPSEEK_API_KEY}
    base-url: ${DEEPSEEK_BASE_URL:https://api.deepseek.com}
    model: ${DEEPSEEK_MODEL:deepseek-chat}
    temperature: ${DEEPSEEK_TEMPERATURE:0.7}
    max-tokens: ${DEEPSEEK_MAX_TOKENS:2000}
```

### Next.js Configuration
```javascript
// frontend/next.config.mjs
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    // Note: API keys should NEVER be exposed to frontend
    // Backend handles all external API calls
  },
};
```

## 📊 Monitoring & Alerts

### Usage Monitoring Script
```bash
#!/bin/bash
# scripts/monitor-api-usage.sh

# Check current month usage
USAGE=$(curl -s https://api.deepseek.com/v1/usage \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" | jq '.usage.current_month')

# Alert if usage exceeds 80%
if [ "$USAGE" -gt 80 ]; then
  echo "⚠️  API usage at ${USAGE}% - consider upgrading plan"
  # Send alert (email, Slack, etc.)
fi
```

### Rate Limit Monitoring
```bash
# Check rate limit headers
curl -I https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" | \
  grep -i "rate-limit"
```

## 🧪 Testing Key Changes

### Validation Test Suite
```bash
#!/bin/bash
# scripts/test-api-key.sh

set -e

echo "🧪 Testing DeepSeek API Key Configuration..."

# Test 1: Environment variable exists
if [ -z "${DEEPSEEK_API_KEY}" ]; then
  echo "❌ FAIL: DEEPSEEK_API_KEY not set"
  exit 1
fi
echo "✅ PASS: API key is set"

# Test 2: Valid format
if [[ ! "${DEEPSEEK_API_KEY}" =~ ^sk-[a-zA-Z0-9]{32,}$ ]]; then
  echo "❌ FAIL: Invalid API key format"
  exit 1
fi
echo "✅ PASS: Valid key format"

# Test 3: Backend can access key
BACKEND_CHECK=$(docker exec profile-backend printenv DEEPSEEK_API_KEY 2>/dev/null || echo "NOT_FOUND")
if [ "$BACKEND_CHECK" = "NOT_FOUND" ]; then
  echo "❌ FAIL: Backend cannot access API key"
  exit 1
fi
echo "✅ PASS: Backend has access to key"

# Test 4: API connectivity
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  --max-time 10)

if [ "$RESPONSE_CODE" = "200" ]; then
  echo "✅ PASS: API connectivity successful"
elif [ "$RESPONSE_CODE" = "429" ]; then
  echo "⚠️  WARN: Rate limited (normal if testing frequently)"
else
  echo "❌ FAIL: API connectivity failed (HTTP $RESPONSE_CODE)"
  exit 1
fi

echo "🎉 All tests passed!"
```

## 🔄 Automation Scripts

### Automated Key Rotation
```bash
#!/bin/bash
# scripts/rotate-api-key.sh

set -e

# Configuration
ENV_FILE=".env.sit"
BACKUP_DIR="backups/keys"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting API key rotation..."

# 1. Backup current configuration
mkdir -p "$BACKUP_DIR"
cp "$ENV_FILE" "$BACKUP_DIR/${ENV_FILE}.${DATE}"

# 2. Prompt for new key
echo "Please enter new DeepSeek API key:"
read -s NEW_KEY

# 3. Validate format
if [[ ! "$NEW_KEY" =~ ^sk-[a-zA-Z0-9]{32,}$ ]]; then
  echo "❌ Invalid key format"
  exit 1
fi

# 4. Update environment file
sed -i '' "s/DEEPSEEK_API_KEY=.*/DEEPSEEK_API_KEY=${NEW_KEY}/" "$ENV_FILE"

# 5. Restart services
docker-compose -f docker-compose.sit.yml down
docker-compose -f docker-compose.sit.yml up -d

# 6. Test new configuration
sleep 10  # Wait for services to start
./scripts/test-api-key.sh

echo "✅ Key rotation completed successfully"
echo "📝 Old key backed up to: $BACKUP_DIR/${ENV_FILE}.${DATE}"
```

### Key Expiry Reminder
```bash
#!/bin/bash
# scripts/check-key-expiry.sh

# Check when key was last rotated
LAST_ROTATED=$(stat -f "%m" .env.sit)
CURRENT_TIME=$(date +%s)
DAYS_SINCE_ROTATION=$(( (CURRENT_TIME - LAST_ROTATED) / 86400 ))

# Alert if approaching rotation time
if [ "$DAYS_SINCE_ROTATION" -gt 50 ]; then
  echo "⚠️  API key has been in use for $DAYS_SINCE_ROTATION days"
  echo "   Consider rotating soon (recommended: 60 days max)"
fi

if [ "$DAYS_SINCE_ROTATION" -gt 55 ]; then
  echo "🚨 API key rotation overdue!"
  echo "   Please rotate immediately"
fi
```

## 📝 Documentation Update Checklist

When rotating API keys, update:
- [ ] This documentation (API_KEY_MANAGEMENT.md)
- [ ] Team communication channels
- [ ] Deployment runbooks
- [ ] Incident response procedures
- [ ] Audit logs with rotation timestamp

## 🆘 Support & Troubleshooting

### Common Issues

#### "Invalid API Key" Error
```bash
# Check key is properly set
echo "Key length: ${#DEEPSEEK_API_KEY}"
echo "Key prefix: ${DEEPSEEK_API_KEY:0:3}"

# Test with curl directly
curl -v https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}"
```

#### Key Not Loading in Docker
```bash
# Check environment in container
docker exec profile-backend env | grep DEEPSEEK

# Check env file is mounted
docker inspect profile-backend | jq '.[0].Config.Env'

# Restart with explicit env
docker-compose --env-file .env.sit -f docker-compose.sit.yml up -d
```

#### Rate Limiting Issues
```bash
# Check current usage
curl -s https://api.deepseek.com/v1/usage \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" | jq '.'

# Implement retry with backoff
# Already implemented in DeepSeekClient.java
```

### Getting Help
1. **DeepSeek Support**: https://platform.deepseek.com/
2. **Project Issues**: GitHub repository issues
3. **Security Concerns**: Immediately revoke key and contact team

---

**Remember**: API keys are like passwords. Protect them accordingly.