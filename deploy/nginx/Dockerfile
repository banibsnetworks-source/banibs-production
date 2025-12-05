# BANIBS Nginx Proxy Dockerfile
# Simple Nginx image for reverse proxy

FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy Nginx configuration
# (Will be mounted from host in docker-compose)

# Expose HTTP and HTTPS
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
