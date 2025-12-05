# BANIBS Production Deployment Package
## AWS EC2 + Docker + Nginx - Phase D1

**Created**: December 2025  
**Status**: Ready for production deployment

---

## Overview

This directory contains all files needed to deploy BANIBS to production on AWS EC2.

**Deployment Model**: Single EC2 instance running Docker containers for backend, frontend, and Nginx reverse proxy.

---

## Files in This Directory

### Docker Compose

- **`docker-compose.prod.yml`** - Production Docker Compose configuration
  - Defines all services: backend, frontend, proxy, optional MongoDB
  - Configured for internal networking (only proxy exposed)
  - Includes health checks and restart policies

### Nginx Configuration

- **`nginx.prod.conf`** - Nginx reverse proxy configuration
  - HTTPS with Let's Encrypt SSL placeholders
  - API proxying (/api/* → backend)
  - Frontend serving
  - Security headers and rate limiting

- **`nginx/Dockerfile`** - Nginx container Dockerfile
  - Simple Alpine-based Nginx image

### Environment Templates

- **`.env.backend.prod.example`** - Backend environment variables template
  - MongoDB connection
  - JWT secrets
  - CORS configuration
  - Admin credentials
  - BCEE settings

- **`.env.frontend.prod.example`** - Frontend environment variables template
  - Backend API URL
  - Feature flags
  - Analytics configuration

### Helper Scripts

- **`deploy.sh`** - Deployment helper script
  - Interactive menu for common deployment tasks
  - Build, start, stop, logs, status
  - Automated health checks

---

## Quick Start

### 1. Copy Environment Files

```bash
cp .env.backend.prod.example .env.backend.prod
cp .env.frontend.prod.example .env.frontend.prod
```

### 2. Edit Environment Files

Fill in all required values:
- MongoDB connection URL
- JWT secrets (generate with `openssl rand -base64 32`)
- Production domain (REACT_APP_BACKEND_URL)
- Admin credentials

### 3. Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Select option 1 for initial deployment.

### 4. Initialize BCEE

```bash
docker exec -it banibs-backend-prod python3 scripts/bcee_init_schema.py
```

### 5. Configure SSL

Follow **Phase 6** in `/app/DEPLOYMENT_AWS_EC2_PROD.md` to set up Let's Encrypt SSL certificates.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Internet                         │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ HTTPS (443)
                    │ HTTP (80)
                    │
           ┌────────▼────────┐
           │  Nginx Proxy    │  (Port 80, 443)
           │  (Public)       │  ONLY container exposed
           └────────┬────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼─────┐           ┌────▼─────┐
   │ Backend  │           │ Frontend │
   │ (FastAPI)│           │ (React)  │
   │ (Internal│           │ (Internal│
   │  :8001)  │           │  :80)    │
   └────┬─────┘           └──────────┘
        │
   ┌────▼────────┐
   │  MongoDB    │  (MongoDB Atlas or Docker)
   │  (Internal) │
   └─────────────┘
```

**Key Points**:
- All containers communicate via internal Docker network
- ONLY Nginx proxy is exposed to internet (ports 80/443)
- Backend and frontend are NOT directly accessible
- MongoDB can be Atlas (recommended) or self-hosted

---

## Environment Variables Reference

### Critical Variables (MUST be set)

| Variable | Description | Example |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_ACCESS_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Generate with `openssl rand -base64 32` |
| `REACT_APP_BACKEND_URL` | Frontend API URL | `https://banibs.com` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://banibs.com,https://www.banibs.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BCEE_USE_DEV_RATES` | Use static exchange rates | `true` |
| `EMERGENT_LLM_KEY` | LLM integration key | `` |
| `SMTP_HOST` | Email server | `` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable PostHog | `false` |

---

## Common Commands

### Start/Stop

```bash
# Start all containers
docker compose -f docker-compose.prod.yml up -d

# Stop all containers
docker compose -f docker-compose.prod.yml down

# Restart a specific container
docker restart banibs-backend-prod
```

### Logs

```bash
# View backend logs
docker logs banibs-backend-prod

# Follow logs in real-time
docker logs -f banibs-backend-prod

# View last 100 lines
docker logs --tail 100 banibs-backend-prod
```

### Health Checks

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Test backend health
curl http://localhost/api/health

# Test frontend
curl http://localhost/
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

### Containers Won't Start

1. Check environment files exist: `.env.backend.prod`, `.env.frontend.prod`
2. Verify MongoDB connection: Check `MONGO_URL` in backend logs
3. Check port conflicts: `sudo netstat -tlnp | grep -E '80|443'`

### HTTPS Not Working

1. Verify DNS resolves to EC2 IP: `nslookup banibs.com`
2. Check certificate exists: `ls /etc/letsencrypt/live/banibs.com/`
3. Verify Nginx paths match certificates in `nginx.prod.conf`

### Database Connection Errors

1. Test connection string: Use MongoDB Compass or mongosh
2. Check IP whitelist (if using Atlas): Add EC2 IP
3. Verify credentials: Check username/password in MONGO_URL

---

## Security Checklist

- [ ] JWT secrets are random and secure (32+ characters)
- [ ] MongoDB uses strong password
- [ ] CORS_ORIGINS only includes production domains
- [ ] Admin password changed from default
- [ ] SSH access restricted to your IP only
- [ ] UFW firewall enabled (ports 22, 80, 443 only)
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificates configured and auto-renewing

---

## MongoDB Options

### Option A: MongoDB Atlas (Recommended)

**Setup**:
1. Create cluster at https://cloud.mongodb.com
2. Get connection string
3. Add EC2 IP to whitelist
4. Set `MONGO_URL` in `.env.backend.prod`

**Pros**: Managed, automatic backups, scaling, security

### Option B: Self-Hosted in Docker

**Setup**:
1. Uncomment `mongo` service in `docker-compose.prod.yml`
2. Set MongoDB credentials in `.env`
3. Use `MONGO_URL=mongodb://mongo:27017`

**Pros**: Full control, no monthly costs  
**Cons**: Manual backups, scaling, security

---

## Support

For detailed step-by-step instructions, see:
- **`/app/DEPLOYMENT_AWS_EC2_PROD.md`** - Complete deployment guide
- **`/app/BCEE_SCHEMA.md`** - Database schema documentation
- **`/app/BCEE_PHASE5_TEST_REPORT.md`** - Testing results

---

**Status**: Production-ready ✅  
**Last Updated**: December 2025  
**Version**: Phase D1 Baseline
