# BANIBS Production Deployment Guide
## AWS EC2 + Docker + Nginx

**Target Audience**: Founder (Raymond)  
**Deployment Model**: Single EC2 instance with Docker containers  
**Version**: Phase D1 - December 2025

---

## Overview

This guide walks you through deploying BANIBS to production on AWS EC2. By the end, you'll have:

- ✅ EC2 instance (m5a.2xlarge) running Ubuntu 22.04
- ✅ Docker containers for backend, frontend, and Nginx proxy
- ✅ HTTPS with Let's Encrypt SSL certificates
- ✅ MongoDB Atlas or self-hosted MongoDB
- ✅ banibs.com and www.banibs.com live and accessible

**Time Estimate**: 2-3 hours for first-time deployment

---

## Prerequisites

### Required

- AWS Account with billing enabled
- GoDaddy account (for banibs.com domain)
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- Basic command-line knowledge
- Text editor (for editing `.env` files)

### Optional

- MongoDB Atlas account (recommended over self-hosted)
- Domain registrar accounts (Namecheap for other BANIBS domains)

---

## Phase 1: AWS EC2 Instance Setup

### Step 1.1: Launch EC2 Instance

1. **Log in to AWS Console**: https://console.aws.amazon.com
2. **Navigate to EC2**: Services → EC2
3. **Click "Launch Instance"**

**Instance Configuration**:

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `banibs-prod-01` | Or your preferred name |
| **AMI** | Ubuntu Server 22.04 LTS | 64-bit (x86) |
| **Instance Type** | `m5a.2xlarge` | 8 vCPU, 32 GB RAM |
| **Key Pair** | Create new or select existing | **CRITICAL**: Save .pem file securely! |
| **Network** | Default VPC | Or custom if you have one |
| **Storage** | 200 GB gp3 | Expandable later if needed |

4. **Click "Launch Instance"**

### Step 1.2: Allocate Elastic IP

**Why**: Elastic IP ensures your server IP doesn't change on restart.

1. In EC2 Dashboard, go to **Elastic IPs** (left sidebar)
2. Click **"Allocate Elastic IP address"**
3. Click **"Allocate"**
4. Select the new Elastic IP
5. Click **"Actions" → "Associate Elastic IP address"**
6. Select your `banibs-prod-01` instance
7. Click **"Associate"**

**📝 Note**: Write down this Elastic IP address - you'll need it for DNS configuration.

**Example**: `54.123.45.678`

---

### Step 1.3: Configure Security Group

**Goal**: Allow SSH (your IP only), HTTP, and HTTPS traffic.

1. In EC2 Dashboard, click **"Security Groups"** (left sidebar)
2. Find security group attached to your instance
3. Click security group → **"Edit inbound rules"**

**Add these rules**:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | **My IP** | SSH access (YOUR IP ONLY) |
| HTTP | TCP | 80 | 0.0.0.0/0 | Public HTTP access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Public HTTPS access |

**Security Note**: NEVER set SSH (port 22) to 0.0.0.0/0. Always restrict to your IP or VPN IP range.

4. Click **"Save rules"**

---

## Phase 2: First-Time Server Setup

### Step 2.1: Connect via SSH

**On Mac/Linux**:
```bash
# Set permissions on your key file (first time only)
chmod 400 ~/Downloads/your-key-pair.pem

# Connect to server
ssh -i ~/Downloads/your-key-pair.pem ubuntu@YOUR_ELASTIC_IP
```

**On Windows** (using PuTTY):
1. Convert .pem to .ppk using PuTTYgen
2. Use PuTTY to connect with .ppk file
3. Host: `ubuntu@YOUR_ELASTIC_IP`

**Expected**: You should see Ubuntu welcome message and prompt: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

---

### Step 2.2: Update System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim ufw
```

**Time**: ~5 minutes

---

### Step 2.3: Create Application User

**Why**: Running apps as `ubuntu` or `root` is insecure. Create dedicated user.

```bash
# Create user 'banibs'
sudo adduser banibs

# When prompted, enter a strong password
# Other prompts (name, phone, etc.) can be left blank

# Add user to sudo group
sudo usermod -aG sudo banibs

# Add user to docker group (we'll install Docker next)
sudo usermod -aG docker banibs
```

---

### Step 2.4: Basic Server Hardening

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verify firewall status
sudo ufw status

# Disable root SSH login (optional but recommended)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

**Expected Output** (ufw status):
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## Phase 3: Install Docker & Docker Compose

### Step 3.1: Install Docker

```bash
# Install Docker's official GPG key
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version
```

**Expected Output**:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### Step 3.2: Configure Docker for Production

```bash
# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add current user to docker group (to run docker without sudo)
sudo usermod -aG docker ubuntu

# Log out and back in for group changes to take effect
exit

# SSH back in
ssh -i ~/Downloads/your-key-pair.pem ubuntu@YOUR_ELASTIC_IP

# Verify docker works without sudo
docker ps
```

**Expected Output**: Empty list (no containers running yet)

---

## Phase 4: Database Options

### Option A: MongoDB Atlas (RECOMMENDED)

**Pros**:
- Fully managed (automatic backups, scaling, security)
- No server maintenance required
- Professional support available
- Free tier available for small deployments

**Setup Steps**:

1. **Create MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create New Cluster**:
   - Choose AWS as cloud provider
   - Select `us-east-1` region (same as EC2)
   - Choose tier (M10 recommended for production, M0 free tier for testing)
3. **Configure Database Access**:
   - Create database user (username + password)
   - **Save credentials** - you'll need them for MONGO_URL
4. **Configure Network Access**:
   - Add your EC2 Elastic IP to IP whitelist
   - OR allow access from anywhere (0.0.0.0/0) with strong password
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/banibs_prod`

**📝 Save this connection string** - you'll use it in `.env.backend.prod`

---

### Option B: Self-Hosted MongoDB (Advanced)

**Pros**:
- Full control over database
- No monthly costs
- Data stays on your server

**Cons**:
- You manage backups, security, scaling
- Requires more DevOps knowledge
- Single point of failure

**Setup**:
1. Uncomment the `mongo` service in `/app/deploy/docker-compose.prod.yml`
2. Set MongoDB root credentials in `.env` file
3. Configure automated backups (see Appendix B)

**Connection String**: `mongodb://mongo:27017` (if using docker-compose service)

---

## Phase 5: Deploy BANIBS Application

### Step 5.1: Clone Repository

```bash
# Switch to banibs user
sudo su - banibs

# Create app directory
mkdir -p /opt/banibs
cd /opt/banibs

# Clone BANIBS repository
# Option 1: If using git
git clone https://github.com/YOUR_ORG/banibs.git .

# Option 2: If transferring via SCP
# On your local machine:
# scp -i your-key.pem -r /path/to/banibs ubuntu@YOUR_ELASTIC_IP:/tmp/
# Then on server:
# sudo mv /tmp/banibs/* /opt/banibs/
# sudo chown -R banibs:banibs /opt/banibs
```

---

### Step 5.2: Configure Environment Variables

**Backend Configuration**:

```bash
# Navigate to deploy directory
cd /opt/banibs/deploy

# Copy backend environment template
cp .env.backend.prod.example .env.backend.prod

# Edit file
vim .env.backend.prod
```

**Fill in these CRITICAL values**:

```bash
# MongoDB connection (from Atlas or self-hosted)
MONGO_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/banibs_prod"

# Database name
DB_NAME="banibs_prod"

# CORS (your production domain)
CORS_ORIGINS="https://banibs.com,https://www.banibs.com"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="YOUR_GENERATED_SECRET_1"
JWT_REFRESH_SECRET="YOUR_GENERATED_SECRET_2"
JWT_SECRET="YOUR_GENERATED_SECRET_3"

# Admin credentials (change after first login!)
INITIAL_ADMIN_EMAIL="admin@banibs.com"
INITIAL_ADMIN_PASSWORD="YOUR_STRONG_PASSWORD"

# BCEE (leave as true for now)
BCEE_USE_DEV_RATES="true"

# Environment
ENVIRONMENT="production"
DEBUG="false"
```

**Frontend Configuration**:

```bash
# Copy frontend environment template
cp .env.frontend.prod.example .env.frontend.prod

# Edit file
vim .env.frontend.prod
```

**Fill in**:

```bash
# Your production domain (MUST match DNS)
REACT_APP_BACKEND_URL="https://banibs.com"

# Production settings
REACT_APP_ENABLE_VISUAL_EDITS="false"
REACT_APP_MESSAGING_SOURCE="api"
GENERATE_SOURCEMAP="false"
```

**Save and close files** (in vim: `:wq`)

---

### Step 5.3: Build and Start Containers

```bash
# Navigate to deploy directory
cd /opt/banibs/deploy

# Build Docker images (first time only, ~10-15 minutes)
docker compose -f docker-compose.prod.yml build

# Start containers in detached mode
docker compose -f docker-compose.prod.yml up -d

# Check container status
docker compose -f docker-compose.prod.yml ps
```

**Expected Output**: All containers should show status `Up`

```
NAME                     STATUS
banibs-backend-prod      Up 30 seconds (healthy)
banibs-frontend-prod     Up 30 seconds (healthy)
banibs-proxy-prod        Up 30 seconds (healthy)
```

**Check Logs** (if any issues):
```bash
# Backend logs
docker logs banibs-backend-prod

# Frontend logs
docker logs banibs-frontend-prod

# Proxy logs
docker logs banibs-proxy-prod
```

---

### Step 5.4: Initialize BCEE Schema

**Important**: Run this ONCE after first deployment to set up database indexes.

```bash
# Enter backend container
docker exec -it banibs-backend-prod bash

# Run BCEE initialization script
python3 scripts/bcee_init_schema.py

# Exit container
exit
```

**Expected Output**:
```
======================================================================
BCEE v1.0 - Database Schema Initialization
======================================================================

📡 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Current Schema Status:
   Exchange Rates: 11 documents
   ...

✅ BCEE Schema Initialization Complete
======================================================================
```

---

## Phase 6: Configure SSL Certificates (HTTPS)

### Step 6.1: Install Certbot

**Why**: Let's Encrypt provides free SSL certificates. Certbot automates the process.

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# OR use snap (recommended by Let's Encrypt)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

### Step 6.2: Obtain SSL Certificate

**Prerequisites**:
- DNS must be configured (see Phase 7)
- Port 80 must be accessible
- Domain must resolve to your EC2 Elastic IP

**Run Certbot**:

```bash
# Stop Nginx proxy temporarily
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml stop proxy

# Obtain certificate
sudo certbot certonly --standalone \
  -d banibs.com \
  -d www.banibs.com \
  --email your-email@banibs.com \
  --agree-tos \
  --non-interactive

# Start proxy again
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml start proxy
```

**Expected Output**:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/banibs.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/banibs.com/privkey.pem
```

**📝 Note**: Certificates are valid for 90 days. Certbot will auto-renew.

---

### Step 6.3: Configure Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Setup automatic renewal (certbot creates this automatically)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify timer is active
sudo systemctl status certbot.timer
```

**Expected**: Timer should be `active (waiting)`

---

### Step 6.4: Update Nginx Configuration

The Nginx configuration at `/opt/banibs/deploy/nginx.prod.conf` already has SSL configured. Verify paths match:

```bash
# Check certificate paths in nginx config
grep "ssl_certificate" /opt/banibs/deploy/nginx.prod.conf
```

**Should show**:
```
ssl_certificate /etc/letsencrypt/live/banibs.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/banibs.com/privkey.pem;
```

**Restart proxy** to apply SSL:
```bash
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml restart proxy
```

---

## Phase 7: DNS Configuration

### Step 7.1: Configure GoDaddy DNS (banibs.com)

1. **Log in to GoDaddy**: https://dcc.godaddy.com
2. **Navigate to DNS Management**:
   - My Products → banibs.com → DNS
3. **Add/Update A Records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_ELASTIC_IP | 600 |
| A | www | YOUR_ELASTIC_IP | 600 |

4. **Save changes**

**Example**:
```
Type: A
Name: @
Value: 54.123.45.678
TTL: 600 seconds
```

**DNS Propagation**: Changes may take 5-60 minutes to propagate globally.

---

### Step 7.2: Configure Namecheap DNS (Other Domains)

**If you have other BANIBS domains at Namecheap**:

1. **Log in to Namecheap**: https://www.namecheap.com
2. **Navigate to Domain List** → Select domain → Manage
3. **Advanced DNS** tab
4. **Add A Records** (same as GoDaddy):
   - Host: @ → Value: YOUR_ELASTIC_IP
   - Host: www → Value: YOUR_ELASTIC_IP

**OR use CNAME** (alternative):
   - Host: www → Value: banibs.com

---

### Step 7.3: Verify DNS Resolution

**Wait 5-10 minutes** after DNS changes, then test:

```bash
# Check if domain resolves to your IP
nslookup banibs.com
nslookup www.banibs.com

# Or use dig
dig banibs.com +short
dig www.banibs.com +short
```

**Expected Output**: Should show your Elastic IP address

---

## Phase 8: Smoke Test & Verification

### Test 8.1: Backend Health Check

```bash
# Test backend health endpoint
curl http://YOUR_ELASTIC_IP/api/health

# Or via domain (after DNS configured)
curl https://banibs.com/api/health
```

**Expected Output**:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-05T..."
}
```

---

### Test 8.2: Frontend Loads

**Open in browser**:
- http://banibs.com (should redirect to HTTPS)
- https://banibs.com
- https://www.banibs.com

**Expected**:
- ✅ Website loads
- ✅ Green padlock icon (HTTPS)
- ✅ No certificate errors
- ✅ BANIBS homepage visible

---

### Test 8.3: BCEE Multi-Currency Display

1. **Navigate to Marketplace**: https://banibs.com/portal/marketplace
2. **Check product prices**:
   - Should show `$XX.XX` format (USD) for default users
   - Try changing region (if logged in) via API to test multi-currency

**Test API call** (optional):
```bash
# Get supported currencies
curl https://banibs.com/api/bcee/supported-currencies
```

**Expected Output**: JSON with 12 supported currencies

---

### Test 8.4: User Registration & Login

1. **Navigate to**: https://banibs.com/auth/register
2. **Register new test account**
3. **Check confirmation email** (if email configured)
4. **Log in with test account**
5. **Navigate to different sections**:
   - Social Portal
   - Marketplace
   - Business Directory

**Expected**: All pages load without errors

---

## Phase 9: Post-Deployment Checklist

### Immediate Actions

- [ ] **Change admin password** (INITIAL_ADMIN_PASSWORD)
- [ ] **Verify all environment variables** are production values
- [ ] **Test user registration and login flows**
- [ ] **Check HTTPS is enforced** (HTTP redirects to HTTPS)
- [ ] **Verify API endpoints working** (/api/health, /api/bcee/*)
- [ ] **Test file uploads** (if applicable)
- [ ] **Monitor logs** for first 24 hours

### Within First Week

- [ ] **Set up automated backups** (MongoDB Atlas or manual)
- [ ] **Configure CloudWatch alarms** (CPU, disk, memory)
- [ ] **Enable log aggregation** (CloudWatch Logs or third-party)
- [ ] **Document any custom configurations**
- [ ] **Create incident response plan**
- [ ] **Set up monitoring dashboard**

### Ongoing Maintenance

- [ ] **Weekly**: Check container health (`docker ps`)
- [ ] **Monthly**: Review logs for errors
- [ ] **Quarterly**: Test backup restoration
- [ ] **As needed**: Update dependencies (security patches)

---

## Troubleshooting

### Issue: Containers Won't Start

**Symptoms**: `docker compose up` fails or containers exit immediately

**Debugging Steps**:
```bash
# Check logs
docker logs banibs-backend-prod
docker logs banibs-frontend-prod

# Check environment variables
docker exec banibs-backend-prod env | grep MONGO_URL

# Verify MongoDB connection
docker exec banibs-backend-prod curl -f http://localhost:8001/health
```

**Common Causes**:
- Invalid MONGO_URL (check connection string)
- Missing environment variables (check .env files)
- Port conflicts (check if ports 80/443 are already in use)

---

### Issue: Website Not Loading

**Symptoms**: Browser shows "Connection refused" or "Site can't be reached"

**Debugging Steps**:
```bash
# Check if proxy is running
docker ps | grep proxy

# Check if ports are listening
sudo netstat -tlnp | grep -E '80|443'

# Check UFW firewall
sudo ufw status

# Check Nginx logs
docker logs banibs-proxy-prod
```

**Common Causes**:
- Firewall blocking ports 80/443 (check UFW and AWS Security Group)
- Nginx configuration error (check syntax)
- DNS not propagated yet (wait 10-30 minutes)

---

### Issue: HTTPS Certificate Errors

**Symptoms**: "Certificate not valid" or "Connection not secure" warnings

**Debugging Steps**:
```bash
# Check certificate status
sudo certbot certificates

# Verify certificate paths in Nginx config
grep ssl_certificate /opt/banibs/deploy/nginx.prod.conf

# Check certificate files exist
ls -la /etc/letsencrypt/live/banibs.com/
```

**Common Causes**:
- Certificate not yet obtained (run certbot certonly)
- Wrong domain in certificate (ensure banibs.com matches DNS)
- Nginx not reading correct certificate path

---

### Issue: Database Connection Errors

**Symptoms**: Backend logs show "MongoDB connection failed"

**Debugging Steps**:
```bash
# Check MongoDB connection string
docker exec banibs-backend-prod env | grep MONGO_URL

# Test connection from container
docker exec -it banibs-backend-prod bash
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; asyncio.run(AsyncIOMotorClient(os.environ['MONGO_URL']).admin.command('ping'))"
```

**Common Causes**:
- Incorrect MONGO_URL (check username, password, cluster address)
- IP not whitelisted in MongoDB Atlas (add EC2 IP to whitelist)
- Self-hosted MongoDB not running (check docker ps)

---

## Appendix A: Useful Commands

### Docker Management

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-name>

# Follow logs in real-time
docker logs -f <container-name>

# Restart a container
docker restart <container-name>

# Stop all containers
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml down

# Start all containers
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml up -d

# Rebuild containers (after code changes)
docker compose -f /opt/banibs/deploy/docker-compose.prod.yml up -d --build

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Enter a running container
docker exec -it banibs-backend-prod bash
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
# (Press 'q' to quit)

# Check running processes
ps aux | grep docker

# Monitor container stats
docker stats
```

### Log Management

```bash
# View backend logs
docker logs banibs-backend-prod

# View Nginx access logs
docker logs banibs-proxy-prod | grep "GET"

# View last 100 lines
docker logs --tail 100 banibs-backend-prod

# View logs from last hour
docker logs --since 1h banibs-backend-prod
```

---

## Appendix B: Backup Strategy

### MongoDB Atlas Backups (Automatic)

**Included with M10+ clusters**:
- Automatic snapshots every 6-12 hours
- Point-in-time recovery
- 2-day retention (configurable up to 35 days)

**Access**:
1. MongoDB Atlas Dashboard → Cluster → Backup
2. Click "Restore" to recover from snapshot

---

### Self-Hosted MongoDB Backups

**Daily Backup Script**:

```bash
#!/bin/bash
# /opt/banibs/scripts/backup_mongo.sh

BACKUP_DIR="/opt/banibs/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MONGO_CONTAINER="mongo"

# Create backup
docker exec $MONGO_CONTAINER mongodump \
  --out=/data/backup_$TIMESTAMP \
  --gzip

# Copy backup to host
docker cp $MONGO_CONTAINER:/data/backup_$TIMESTAMP $BACKUP_DIR/

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/backup_$TIMESTAMP"
```

**Setup Cron Job**:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/banibs/scripts/backup_mongo.sh >> /opt/banibs/logs/backup.log 2>&1
```

---

## Appendix C: Scaling Considerations

### When to Scale Up

**Indicators**:
- CPU usage consistently > 70%
- Memory usage consistently > 75%
- Response times increasing
- Database connections maxing out

**Vertical Scaling** (Easier):
1. Stop application: `docker compose down`
2. In AWS Console, stop EC2 instance
3. Change instance type (e.g., m5a.2xlarge → m5a.4xlarge)
4. Start instance
5. Start application: `docker compose up -d`

**Horizontal Scaling** (More Complex):
- Requires load balancer (AWS ALB)
- Multiple EC2 instances
- Shared database (MongoDB Atlas recommended)
- Session management across instances
- Beyond scope of Phase D1

---

## Appendix D: Security Best Practices

### SSL/TLS

- ✅ Always use HTTPS in production
- ✅ Enforce HSTS (enabled in nginx.prod.conf)
- ✅ Use strong ciphers (configured in nginx.prod.conf)
- ✅ Auto-renew certificates (certbot handles this)

### Authentication

- ✅ Use strong JWT secrets (32+ characters, random)
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Implement rate limiting (enabled in Nginx)
- ✅ Use HTTPS-only cookies for sessions

### Database

- ✅ Use strong MongoDB credentials
- ✅ Restrict IP access (MongoDB Atlas whitelist)
- ✅ Enable authentication (always)
- ✅ Encrypt connections (TLS/SSL)

### Server

- ✅ Keep system updated (`apt update && apt upgrade`)
- ✅ Use UFW firewall (enabled in guide)
- ✅ Disable root SSH login (optional step in guide)
- ✅ Use SSH keys, not passwords
- ✅ Monitor logs for suspicious activity

---

## Support & Next Steps

### If You Get Stuck

1. **Check logs first**: Most issues show up in container logs
2. **Review Troubleshooting section**: Common issues are documented
3. **Test in isolation**: Test backend, frontend, database separately
4. **Verify environment variables**: Most errors are configuration issues

### After Successful Deployment

**Recommended Next Steps**:
1. Set up monitoring (CloudWatch, Datadog, or similar)
2. Configure alerting for downtime/errors
3. Document any custom configurations
4. Create runbook for common maintenance tasks
5. Plan for BCEE Phase 6 (Currency Selector UI, IP Geolocation)

### Future Enhancements

- **Phase D2**: CI/CD pipeline (GitHub Actions)
- **Phase D3**: Multi-region deployment
- **Phase D4**: CDN integration (CloudFront)
- **Phase D5**: Advanced monitoring and alerting

---

**End of Deployment Guide**

**Status**: Ready for production deployment ✅  
**Last Updated**: December 2025  
**Version**: Phase D1 Baseline
