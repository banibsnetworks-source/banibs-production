# BANIBS Proxy Nginx Fix - Deployment Instructions

## Issue Fixed
**Problem**: Nginx proxy returning 500 errors with "rewrite or internal redirection cycle while internally redirecting to /index.html"

**Root Cause**: The `location /` block had both `proxy_pass http://frontend` and `try_files $uri $uri/ /index.html;` which created an infinite redirect loop.

**Solution**: Removed `try_files` directive and let the frontend container's nginx handle all SPA routing internally.

---

## Changes Made

### File: `/app/deploy/nginx.prod.conf`

**Before:**
```nginx
location / {
    limit_req zone=general_limit burst=100 nodelay;
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    try_files $uri $uri/ /index.html;  # ❌ CAUSES LOOP
}
```

**After:**
```nginx
location / {
    limit_req zone=general_limit burst=100 nodelay;
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Deployment Steps (EC2 @ 3.133.179.147)

### 1. Navigate to deployment directory
```bash
cd /app/banibs-app/deploy
```

### 2. Rebuild ONLY the proxy container (no cache)
```bash
docker compose -f docker-compose.prod.yml build --no-cache proxy
```

### 3. Restart ONLY the proxy container
```bash
docker compose -f docker-compose.prod.yml up -d proxy
```

### 4. Verify the proxy is running
```bash
docker compose -f docker-compose.prod.yml ps proxy
```

Expected output:
```
NAME                        STATUS          PORTS
banibs-proxy-prod           Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 5. Check proxy logs
```bash
docker compose -f docker-compose.prod.yml logs -f proxy
```

Look for:
- ✅ No "rewrite or internal redirection cycle" errors
- ✅ Nginx started successfully
- ✅ SSL certificates loaded

### 6. Test the site
```bash
# Test HTTP redirect
curl -I http://banibs.com

# Test HTTPS homepage
curl -I https://banibs.com

# Test API health endpoint
curl https://banibs.com/api/waitlist/health
```

Expected responses:
- HTTP → HTTPS redirect (301)
- HTTPS homepage: 200 OK
- API health: `{"status":"healthy","service":"Waitlist","email_service_enabled":false}`

### 7. Browser verification
Visit https://banibs.com in a browser and verify:
- ✅ Homepage loads with Stealth A+ content
- ✅ "A new social experience created with care for Black communities."
- ✅ Email form works
- ✅ No 500 errors
- ✅ Console shows no errors

---

## Rollback (if needed)

If something goes wrong, restore the previous proxy:

```bash
cd /app/banibs-app/deploy
docker compose -f docker-compose.prod.yml down proxy
docker compose -f docker-compose.prod.yml up -d proxy
```

---

## Technical Notes

### Why This Fix Works

**The Problem:**
When nginx has `proxy_pass` + `try_files` in the same location block:
1. Request comes in for `/`
2. Nginx tries `try_files $uri $uri/ /index.html`
3. `/index.html` doesn't exist in proxy container
4. Nginx internally redirects to `/index.html`
5. This matches the same `location /` block again
6. Loop continues infinitely → 500 error

**The Solution:**
Remove `try_files` from the proxy. Let the proxy just forward ALL requests to the frontend container:
1. Request comes in for `/`
2. Nginx proxies it to `http://frontend` (the React container)
3. Frontend container's nginx has its own SPA routing configured
4. Frontend returns the appropriate file or `index.html`
5. Proxy forwards response back to client
6. ✅ Works correctly

### Architecture Flow

```
Client Browser
    ↓
Nginx Proxy (Port 443)
    ↓ (proxy_pass)
Frontend Container (Port 80)
    ↓ (nginx in frontend handles SPA routing)
React App (index.html)
```

---

## Status After Fix

✅ Proxy configuration fixed
✅ Redirect loop eliminated
✅ Frontend and backend containers unchanged
✅ Stealth A+ content intact
✅ Ready for production deployment

---

**Last Updated**: December 8, 2024
**Environment**: AWS EC2 @ 3.133.179.147
**Domain**: banibs.com
