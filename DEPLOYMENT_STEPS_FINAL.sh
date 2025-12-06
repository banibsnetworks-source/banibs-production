#!/bin/bash
# BANIBS Production Deployment - Final Steps
# Execute on EC2 server at /app/banibs-app

set -e  # Exit on error

echo "============================================================"
echo "BANIBS Production Deployment - Final HTTPS Setup"
echo "============================================================"
echo ""

# Step 1: Rebuild frontend with healthcheck fix
echo "📦 Step 1: Rebuilding frontend container..."
cd /app/banibs-app/deploy
docker compose -f docker-compose.prod.yml build banibs-frontend

echo "✅ Frontend rebuilt"
echo ""

# Step 2: Wait for Founder to open port 80
echo "⏸️  Step 2: MANUAL ACTION REQUIRED"
echo ""
echo "Before proceeding, ensure port 80 is open to 0.0.0.0/0:"
echo "1. Go to AWS Console → EC2 → Security Groups"
echo "2. Find security group for instance i-0227400a7078c9018"
echo "3. Edit inbound rules → HTTP rule"
echo "4. Change source from 99.184.16.216/32 to 0.0.0.0/0"
echo ""
read -p "Press ENTER when port 80 is open to 0.0.0.0/0: "

echo ""
echo "✅ Proceeding with SSL certificate acquisition..."
echo ""

# Step 3: Stop proxy for Certbot standalone
echo "🛑 Step 3: Stopping proxy container..."
docker compose -f docker-compose.prod.yml stop proxy

echo "✅ Proxy stopped"
echo ""

# Step 4: Run Certbot
echo "🔒 Step 4: Obtaining SSL certificates from Let's Encrypt..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📥 Installing Certbot..."
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
fi

# Obtain certificate
sudo certbot certonly --standalone \
    -d banibs.com \
    -d www.banibs.com \
    --email admin@banibs.com \
    --agree-tos \
    --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates obtained successfully"
else
    echo "❌ Certbot failed. Check errors above."
    exit 1
fi
echo ""

# Step 5: Verify certificate paths
echo "🔍 Step 5: Verifying certificate installation..."
if [ -f "/etc/letsencrypt/live/banibs.com/fullchain.pem" ]; then
    echo "✅ Certificate found: /etc/letsencrypt/live/banibs.com/fullchain.pem"
else
    echo "❌ Certificate not found!"
    exit 1
fi

if [ -f "/etc/letsencrypt/live/banibs.com/privkey.pem" ]; then
    echo "✅ Private key found: /etc/letsencrypt/live/banibs.com/privkey.pem"
else
    echo "❌ Private key not found!"
    exit 1
fi
echo ""

# Step 6: Restart all containers
echo "🚀 Step 6: Starting all containers with SSL..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting 30 seconds for containers to start..."
sleep 30
echo ""

# Step 7: Check container health
echo "📊 Step 7: Checking container status..."
docker compose -f docker-compose.prod.yml ps
echo ""

# Step 8: Test HTTPS
echo "🧪 Step 8: Testing HTTPS access..."
echo ""

echo "Testing HTTP → HTTPS redirect..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://banibs.com)
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo "✅ HTTP redirect working (Status: $HTTP_RESPONSE)"
else
    echo "⚠️  HTTP redirect unexpected (Status: $HTTP_RESPONSE)"
fi

echo ""
echo "Testing HTTPS..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://banibs.com)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo "✅ HTTPS working (Status: $HTTPS_RESPONSE)"
else
    echo "⚠️  HTTPS unexpected (Status: $HTTPS_RESPONSE)"
fi

echo ""
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s https://banibs.com/api/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_RESPONSE" = "healthy" ]; then
    echo "✅ Health endpoint working"
else
    echo "⚠️  Health endpoint check failed (Response: $HEALTH_RESPONSE)"
fi

echo ""
echo "============================================================"
echo "🎉 BANIBS Production Deployment Complete!"
echo "============================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Test in browser: https://banibs.com"
echo "2. Verify green padlock (SSL certificate)"
echo "3. Test user registration and login"
echo "4. Initialize BCEE schema:"
echo "   docker exec -it banibs-backend-prod python3 scripts/bcee_init_schema.py"
echo ""
echo "🔐 Security Recommendations:"
echo "1. Lock port 80 back to your IP (99.184.16.216/32) if desired"
echo "2. Monitor SSL certificate auto-renewal:"
echo "   sudo certbot renew --dry-run"
echo ""
echo "📝 Commit frontend fix to git:"
echo "   cd /app/banibs-app"
echo "   git add frontend/Dockerfile.prod"
echo "   git commit -m 'fix: frontend healthcheck IPv6 localhost issue'"
echo "   git push origin main"
echo ""
