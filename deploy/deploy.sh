#!/bin/bash
# BANIBS Production Deployment Script
# Quick deployment helper for AWS EC2

set -e  # Exit on error

echo "============================================================"
echo "BANIBS Production Deployment - Phase D1"
echo "============================================================"
echo ""

# Check if running as banibs user
if [ "$USER" != "banibs" ]; then
    echo "⚠️  Warning: Not running as 'banibs' user. Switch with: sudo su - banibs"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env files exist
if [ ! -f ".env.backend.prod" ]; then
    echo "❌ Error: .env.backend.prod not found!"
    echo "   Copy from .env.backend.prod.example and fill in values."
    exit 1
fi

if [ ! -f ".env.frontend.prod" ]; then
    echo "❌ Error: .env.frontend.prod not found!"
    echo "   Copy from .env.frontend.prod.example and fill in values."
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "   Follow Phase 3 of deployment guide to install Docker."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Ask for deployment action
echo "Select deployment action:"
echo "1) Initial deployment (build + start)"
echo "2) Rebuild and restart (after code changes)"
echo "3) Start containers"
echo "4) Stop containers"
echo "5) View logs"
echo "6) Check status"
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Building Docker images (this may take 10-15 minutes)..."
        docker compose -f docker-compose.prod.yml build
        
        echo ""
        echo "🚀 Starting containers..."
        docker compose -f docker-compose.prod.yml up -d
        
        echo ""
        echo "⏳ Waiting for containers to be healthy..."
        sleep 10
        
        echo ""
        echo "📊 Container status:"
        docker compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "✅ Initial deployment complete!"
        echo ""
        echo "Next steps:"
        echo "1. Run BCEE schema initialization:"
        echo "   docker exec -it banibs-backend-prod python3 scripts/bcee_init_schema.py"
        echo "2. Test health endpoint: curl http://localhost/api/health"
        echo "3. Configure SSL certificates (see deployment guide Phase 6)"
        ;;
    
    2)
        echo ""
        echo "🔄 Rebuilding and restarting containers..."
        docker compose -f docker-compose.prod.yml up -d --build
        
        echo ""
        echo "📊 Container status:"
        docker compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "✅ Rebuild complete!"
        ;;
    
    3)
        echo ""
        echo "🚀 Starting containers..."
        docker compose -f docker-compose.prod.yml up -d
        
        echo ""
        echo "📊 Container status:"
        docker compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "✅ Containers started!"
        ;;
    
    4)
        echo ""
        echo "🛑 Stopping containers..."
        docker compose -f docker-compose.prod.yml down
        
        echo ""
        echo "✅ Containers stopped!"
        ;;
    
    5)
        echo ""
        echo "📋 Select container to view logs:"
        echo "1) Backend"
        echo "2) Frontend"
        echo "3) Proxy"
        read -p "Enter choice (1-3): " log_choice
        
        case $log_choice in
            1) docker logs -f banibs-backend-prod ;;
            2) docker logs -f banibs-frontend-prod ;;
            3) docker logs -f banibs-proxy-prod ;;
            *) echo "Invalid choice" ;;
        esac
        ;;
    
    6)
        echo ""
        echo "📊 Container status:"
        docker compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "📊 Container health:"
        docker ps --format "table {{.Names}}\t{{.Status}}"
        
        echo ""
        echo "📊 Resource usage:"
        docker stats --no-stream
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "============================================================"
