# BANIBS Deployment Notes

## Overview
This document provides instructions for deploying the BANIBS platform to production environments beyond Railway. The application is designed to be environment-agnostic and can be deployed to any host supporting Docker containers or traditional server environments.

---

## Architecture

### Tech Stack
- **Frontend**: React (Create React App with Tailwind CSS)
- **Backend**: FastAPI (Python 3.9+)
- **Database**: MongoDB 5.0+
- **File Storage**: AWS S3 or local filesystem
- **Email**: SMTP (any provider: Gmail, SendGrid, SES, etc.)

### Service Requirements
- **Backend**: Python 3.9+, pip, FastAPI, Motor (MongoDB async driver)
- **Frontend**: Node.js 16+, yarn
- **Database**: MongoDB instance (local or cloud like MongoDB Atlas)
- **Reverse Proxy**: Nginx or similar (for serving frontend and proxying API)

---

## Environment Variables

### Backend (.env in `/app/backend/`)

```bash
# === DATABASE ===
MONGO_URL=mongodb://localhost:27017
DB_NAME=banibs

# === JWT AUTHENTICATION ===
JWT_SECRET=your-very-secure-random-string-here
JWT_ALGORITHM=HS256

# === ADMIN SEED (for initial setup) ===
ADMIN_EMAIL=admin@banibs.com
ADMIN_PASSWORD=SecurePassword123!

# === CORS ===
CORS_ORIGINS=https://www.banibs.com,https://banibs.com

# === AWS S3 (Optional - falls back to local uploads) ===
S3_BUCKET_NAME=banibs-uploads
AWS_REGION=us-east-1
CLOUDFRONT_URL=https://cdn.banibs.com
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# === EMAIL / SMTP (Phase 3.3) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@banibs.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM="BANIBS <noreply@banibs.com>"
```

### Frontend (.env in `/app/frontend/`)

```bash
# === API BASE URL ===
REACT_APP_BACKEND_URL=https://api.banibs.com

# === ASSETS/CDN (Optional) ===
REACT_APP_ASSETS_URL=https://cdn.banibs.com
```

**CRITICAL**: The `REACT_APP_BACKEND_URL` must point to your backend API. All backend routes are prefixed with `/api`.

---

## Deployment Options

### Option 1: Vercel (Frontend) + Fly.io/Render (Backend)

#### Frontend (Vercel)
1. **Connect GitHub repo** to Vercel
2. **Set build settings**:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`
3. **Set environment variables**:
   - `REACT_APP_BACKEND_URL=https://api.banibs.com`
4. **Deploy**: Vercel will auto-deploy on push to main

#### Backend (Fly.io example)
1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Create fly.toml** in `/app/backend/`:
   ```toml
   app = "banibs-api"
   primary_region = "iad"
   
   [build]
     builder = "paketobuildpacks/builder:base"
     buildpacks = ["gcr.io/paketo-buildpacks/python"]
   
   [env]
     PORT = "8001"
   
   [[services]]
     http_checks = []
     internal_port = 8001
     protocol = "tcp"
   
     [[services.ports]]
       handlers = ["http"]
       port = 80
   
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

3. **Deploy**:
   ```bash
   cd /app/backend
   fly launch
   fly secrets set MONGO_URL="mongodb+srv://..." JWT_SECRET="..." SMTP_HOST="..." SMTP_USER="..." SMTP_PASS="..."
   fly deploy
   ```

---

### Option 2: AWS Amplify (Frontend) + AWS ECS (Backend)

#### Frontend (AWS Amplify)
1. **Connect repo** to Amplify Console
2. **Build settings** (amplify.yml):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - yarn install
       build:
         commands:
           - yarn build
     artifacts:
       baseDirectory: frontend/build
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```

3. **Environment variables**:
   - `REACT_APP_BACKEND_URL=https://api.banibs.com`

#### Backend (AWS ECS/Fargate)
1. **Containerize backend** (Dockerfile in `/app/backend/`):
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8001
   
   CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
   ```

2. **Push to ECR** and **deploy to ECS** with environment variables

---

### Option 3: Traditional VPS (DigitalOcean, Linode, etc.)

#### Server Setup (Ubuntu 22.04)
```bash
# Install dependencies
sudo apt update
sudo apt install -y python3.9 python3-pip nodejs npm mongodb nginx

# Install yarn
sudo npm install -g yarn

# Clone repo
git clone https://github.com/your-org/banibs.git
cd banibs

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python scripts/seed_admin.py  # Create initial admin

# Frontend setup
cd ../frontend
yarn install
yarn build
```

#### Supervisor Config (`/etc/supervisor/conf.d/banibs.conf`)
```ini
[program:banibs-backend]
command=/home/user/banibs/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=/home/user/banibs/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/banibs/backend.err.log
stdout_logfile=/var/log/banibs/backend.out.log
environment=PATH="/home/user/banibs/backend/venv/bin"
```

#### Nginx Config (`/etc/nginx/sites-available/banibs`)
```nginx
server {
    listen 80;
    server_name banibs.com www.banibs.com;
    
    # Frontend
    location / {
        root /home/user/banibs/frontend/build;
        try_files $uri /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static uploads (if not using S3)
    location /uploads/ {
        alias /home/user/banibs/backend/uploads/;
    }
}
```

#### Enable & Start
```bash
sudo ln -s /etc/nginx/sites-available/banibs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start banibs-backend
```

---

## Database Setup

### Option A: MongoDB Atlas (Recommended for Production)
1. Create cluster at https://cloud.mongodb.com
2. Whitelist server IP
3. Create database user
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/banibs`
5. Set `MONGO_URL` environment variable

### Option B: Self-Hosted MongoDB
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Set MONGO_URL=mongodb://localhost:27017
```

---

## Initial Setup & Seeding

### 1. Create Admin User
```bash
cd /app/backend
python scripts/seed_admin.py
```

This creates the initial admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

### 2. Verify Backend Health
```bash
curl https://api.banibs.com/api/
# Should return: {"message":"Hello World"}
```

### 3. Test Admin Login
```bash
curl -X POST https://api.banibs.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@banibs.com","password":"your-password"}'
# Should return JWT tokens
```

---

## SMTP / Email Setup

### Option A: Gmail (Development/Small Scale)
1. Enable 2FA on Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Set environment variables:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM="BANIBS <your-email@gmail.com>"
   ```

### Option B: SendGrid (Recommended for Production)
1. Create account at https://sendgrid.com
2. Generate API key
3. Set environment variables:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your-api-key
   EMAIL_FROM="BANIBS <noreply@banibs.com>"
   ```

### Option C: AWS SES
1. Verify domain in AWS SES
2. Create SMTP credentials
3. Set environment variables:
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=AKIA...
   SMTP_PASS=generated-password
   EMAIL_FROM="BANIBS <noreply@banibs.com>"
   ```

**Fallback**: If SMTP is not configured, emails will be logged to console (see backend logs).

---

## File Upload Setup

### Option A: AWS S3 (Recommended for Production)
1. Create S3 bucket
2. Set bucket policy for public read:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicRead",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::banibs-uploads/*"
       }
     ]
   }
   ```
3. Create IAM user with S3 permissions
4. Set environment variables:
   ```bash
   S3_BUCKET_NAME=banibs-uploads
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   CLOUDFRONT_URL=https://cdn.banibs.com  # Optional
   ```

### Option B: Local Filesystem (Development)
- No configuration needed
- Files stored in `/app/backend/uploads/`
- Served via Nginx `/uploads/` location

---

## SSL/HTTPS Setup

### Option A: Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d banibs.com -d www.banibs.com
sudo certbot renew --dry-run  # Test auto-renewal
```

### Option B: Cloudflare (Free SSL + CDN)
1. Add domain to Cloudflare
2. Point DNS to your server
3. Enable "Full (strict)" SSL mode
4. Cloudflare handles HTTPS automatically

---

## Monitoring & Logging

### Backend Logs
```bash
# Supervisor logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log

# Request logs (Phase 3.5)
# Format: {METHOD} {PATH} - Status: {STATUS_CODE} - Duration: {SECONDS}s
grep "GET /api/opportunities" /var/log/supervisor/backend.out.log
```

### Frontend Logs
- Browser console (development)
- Vercel/Amplify logs (production)

### Database Logs
```bash
# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Recommended Tools
- **APM**: New Relic, DataDog
- **Log Aggregation**: Logtail, Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry (for both frontend and backend)

---

## Performance Optimization

### Backend
- **Gunicorn** with multiple workers:
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
  ```
- **Redis** caching for frequently accessed data
- **Database indexing**: Index on `approved`, `featured`, `contributor_id`, `createdAt`

### Frontend
- **CDN**: Serve static assets via CloudFlare, CloudFront, or Vercel Edge Network
- **Code splitting**: Already configured in Create React App
- **Image optimization**: Use WebP format for opportunity images

### Database
```javascript
// MongoDB indexes
db.opportunities.createIndex({ approved: 1, featured: 1 })
db.opportunities.createIndex({ contributor_id: 1, createdAt: -1 })
db.opportunities.createIndex({ type: 1, approved: 1 })
db.contributors.createIndex({ email: 1 }, { unique: true })
db.moderation_logs.createIndex({ opportunity_id: 1, timestamp: -1 })
db.moderation_logs.createIndex({ moderator_user_id: 1, timestamp: -1 })
```

---

## Security Checklist

- [ ] **JWT_SECRET**: Use strong random string (min 32 characters)
- [ ] **HTTPS**: All traffic encrypted (Let's Encrypt or Cloudflare)
- [ ] **CORS**: Restrict `CORS_ORIGINS` to your domain only
- [ ] **MongoDB**: Enable authentication, restrict IP access
- [ ] **Admin Password**: Strong password for seed admin account
- [ ] **SMTP Credentials**: Use app-specific passwords or API keys
- [ ] **AWS Keys**: Use IAM roles when possible, restrict bucket access
- [ ] **Rate Limiting**: Add rate limiting middleware to FastAPI
- [ ] **Input Validation**: Already handled by Pydantic models
- [ ] **SQL Injection**: Not applicable (using MongoDB)
- [ ] **XSS**: React escapes by default, but sanitize user-generated HTML if needed

---

## Scaling Considerations

### Horizontal Scaling
- **Backend**: Deploy multiple instances behind a load balancer
- **Frontend**: Automatically scaled by Vercel/Amplify/CloudFlare
- **Database**: MongoDB Atlas auto-scales, or use replica sets

### Vertical Scaling
- **Backend**: Increase CPU/RAM for backend instances
- **Database**: Upgrade MongoDB Atlas tier

### Caching
- **Redis**: Cache opportunity lists, contributor profiles
- **CDN**: Cache frontend assets, images, API responses (with appropriate TTLs)

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Manual backup
mongodump --uri="mongodb://localhost:27017/banibs" --out=/backups/banibs-$(date +%Y%m%d)

# Automated daily backups (cron)
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/banibs" --out=/backups/banibs-$(date +\%Y\%m\%d)
```

### MongoDB Atlas
- Automatic continuous backups
- Point-in-time recovery
- Download snapshots

### File Uploads (S3)
- Enable S3 versioning
- Configure lifecycle rules
- Cross-region replication (optional)

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Common issues:
# - Missing env vars: Check .env file
# - MongoDB not running: sudo systemctl start mongod
# - Port conflict: lsof -i :8001
# - Import errors: pip install -r requirements.txt
```

### Frontend Build Fails
```bash
# Check Node/Yarn versions
node -v  # Should be 16+
yarn -v

# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Email Not Sending
```bash
# Check SMTP logs in backend.out.log
grep "SMTP" /var/log/supervisor/backend.out.log

# Test SMTP manually
python3 -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-app-password')
server.quit()
print('SMTP works!')
"
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/banibs"

# For Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/banibs"

# Check network/firewall
telnet smtp.gmail.com 587
```

---

## Cost Estimation (Monthly)

### Small Scale (< 1000 users/month)
- **Hosting**: Fly.io/Render Free Tier + Vercel Free
- **Database**: MongoDB Atlas Free Tier (512MB)
- **Email**: SendGrid Free Tier (100 emails/day)
- **Storage**: S3 Free Tier (5GB)
- **Total**: $0-10/month

### Medium Scale (1000-10,000 users/month)
- **Hosting**: Fly.io Hobby (~$10) + Vercel Hobby ($20)
- **Database**: MongoDB Atlas Shared M2 (~$9)
- **Email**: SendGrid Essentials (~$15)
- **Storage**: S3 (~$5)
- **CDN**: CloudFlare Free
- **Total**: ~$60/month

### Large Scale (10,000+ users/month)
- **Hosting**: AWS ECS/EC2 (~$50-100)
- **Database**: MongoDB Atlas Dedicated M10 (~$57)
- **Email**: SendGrid Pro (~$90)
- **Storage**: S3 + CloudFront (~$20)
- **Monitoring**: DataDog/New Relic (~$50)
- **Total**: ~$250-350/month

---

## Migration from Railway

### Export Data
```bash
# Connect to Railway MongoDB
mongodump --uri="mongodb://railway-mongo-url" --out=/tmp/railway-backup

# Import to new MongoDB
mongorestore --uri="mongodb://new-mongo-url" /tmp/railway-backup
```

### Update Environment Variables
1. Copy `.env` files from Railway
2. Update `REACT_APP_BACKEND_URL` to new backend URL
3. Update `CORS_ORIGINS` to new frontend domain
4. Re-deploy both services

### DNS Update
1. Update DNS A record to point to new server IP
2. Or update CNAME if using Vercel/Amplify
3. Wait for DNS propagation (up to 48 hours)

---

## Support & Resources

- **Backend Logs**: `/var/log/supervisor/backend.*.log`
- **Request Logs**: Automatically logged by RequestLoggingMiddleware
- **Email Logs**: Check backend logs if SMTP not configured
- **Database**: Check MongoDB logs or Atlas dashboard
- **CDN**: CloudFlare, CloudFront analytics dashboards

---

## Version History

- **v2.0 (Phase 3)**: Contributor profiles, moderation logs, email notifications, production prep
- **v1.9 (Phase 2.9)**: Contributor auth, public submissions, admin analytics
- **v1.8 (Phase 2.8)**: JWT authentication, S3 uploads, admin dashboard
- **v1.7 (Phase 2.7)**: Basic CRUD, admin approval workflow

---

**Last Updated**: Phase 3 - January 2025
