#!/bin/bash
#
# BPOC Tier 3 Rollout Protocol - Batch 1 (FIXED VERSION)
# Sister Network + Brother Network + Safe Places + Circles + AI Mentor + Community AI
# Multi-Module Drop Protocol v3 - Cross-Layer Expansion (Layer 3 + Layer 4)
#
# FIXES:
# - Added curl timeouts (--max-time 30)
# - Added HTTP status code validation
# - Improved JSON parsing error handling
# - Added retry logic for failed API calls
# - Better error messages and early exit on critical failures
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${REACT_APP_BACKEND_URL:-http://localhost:8001}"
ADMIN_EMAIL="social_test_user@example.com"
ADMIN_PASSWORD="TestPass123!"
CORRELATION_ID="TIER_3_BATCH_1_FIXED"
CURL_TIMEOUT=30
MAX_RETRIES=3

# Helper function: Make API call with timeout and retry
api_call() {
    local method="$1"
    local endpoint="$2"
    local auth_header="$3"
    local data="${4:-}"
    local retry=0
    
    while [ $retry -lt $MAX_RETRIES ]; do
        if [ -z "$data" ]; then
            response=$(curl -s --max-time $CURL_TIMEOUT -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint" -H "$auth_header" 2>&1)
        else
            response=$(curl -s --max-time $CURL_TIMEOUT -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint" -H "$auth_header" -H "Content-Type: application/json" -d "$data" 2>&1)
        fi
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
            echo "$body"
            return 0
        else
            retry=$((retry + 1))
            if [ $retry -lt $MAX_RETRIES ]; then
                echo -e "${YELLOW}⚠️  API call failed (HTTP $http_code), retrying ($retry/$MAX_RETRIES)...${NC}" >&2
                sleep 2
            else
                echo -e "${RED}❌ API call failed after $MAX_RETRIES attempts (HTTP $http_code)${NC}" >&2
                echo "$body" >&2
                return 1
            fi
        fi
    done
}

# Helper function: Parse JSON safely
parse_json() {
    local json="$1"
    local query="$2"
    
    result=$(echo "$json" | python3 -c "import sys,json; 
try: 
    d=json.load(sys.stdin); 
    print($query)
except Exception as e: 
    print('', file=sys.stderr); 
    sys.exit(1)" 2>&1)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ JSON parsing failed${NC}" >&2
        echo "$json" >&2
        return 1
    fi
    
    echo "$result"
}

echo -e "${BOLD}${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║           BPOC TIER 3 ROLLOUT - MULTI-MODULE BATCH 1 (FIXED)      ║${NC}"
echo -e "${BOLD}${MAGENTA}║      Cross-Layer Expansion: Layer 3 Social + Layer 4 AI            ║${NC}"
echo -e "${BOLD}${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"

# Get admin token
echo -e "\n${BLUE}🔐 Authenticating as admin...${NC}"
auth_response=$(api_call "POST" "/api/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
fi

TOKEN=$(parse_json "$auth_response" "d.get('access_token', '')")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No token received${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Authentication successful${NC}"

# Get module IDs
echo -e "\n${BLUE}📦 Fetching module IDs for Tier 3 batch (6 modules)...${NC}"

get_module_id() {
    local search_term="$1"
    local response=$(api_call "GET" "/api/admin/orchestration/modules?search=$search_term" "Authorization: Bearer $TOKEN")
    if [ $? -ne 0 ]; then
        echo ""
        return 1
    fi
    parse_json "$response" "d['modules'][0]['id'] if d['modules'] else ''"
}

SISTER_ID=$(get_module_id "sister+network")
BROTHER_ID=$(get_module_id "brother+network")
SAFE_PLACES_ID=$(get_module_id "safe+places")
CIRCLES_ID=$(get_module_id "circles")
AI_MENTOR_ID=$(get_module_id "ai+mentor")
COMMUNITY_AI_ID=$(get_module_id "community+ai")

# Validate all IDs were found
if [ -z "$SISTER_ID" ] || [ -z "$BROTHER_ID" ] || [ -z "$SAFE_PLACES_ID" ] || [ -z "$CIRCLES_ID" ] || [ -z "$AI_MENTOR_ID" ] || [ -z "$COMMUNITY_AI_ID" ]; then
    echo -e "${RED}❌ Failed to fetch all module IDs${NC}"
    exit 1
fi

echo -e "${CYAN}Layer 3 Social:${NC}"
echo -e "  Sister Network:    ${YELLOW}$SISTER_ID${NC}"
echo -e "  Brother Network:   ${YELLOW}$BROTHER_ID${NC}"
echo -e "  Safe Places:       ${YELLOW}$SAFE_PLACES_ID${NC}"
echo -e "  Circles:           ${YELLOW}$CIRCLES_ID${NC}"
echo -e "${CYAN}Layer 4 High-Impact AI:${NC}"
echo -e "  AI Mentor Suite:   ${YELLOW}$AI_MENTOR_ID${NC}"
echo -e "  Community AI:      ${YELLOW}$COMMUNITY_AI_ID${NC}"

# ==================== STEP 0: PRE-CHECK (SANITY GATE) ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 0: PRE-CHECK (SANITY GATE) - 6 MODULE CROSS-LAYER BATCH${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}🏗️  Verifying layer classification...${NC}"
LAYER_3_COUNT=0
LAYER_4_COUNT=0

for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    module_response=$(api_call "GET" "/api/admin/orchestration/modules/$MODULE_ID" "Authorization: Bearer $TOKEN")
    NAME=$(parse_json "$module_response" "d['module']['name']")
    LAYER=$(parse_json "$module_response" "d['module']['layer']")
    
    if [[ "$LAYER" == "LAYER_3_SOCIAL" ]]; then
        echo -e "${GREEN}  ✅ $NAME: Layer 3 (Social)${NC}"
        LAYER_3_COUNT=$((LAYER_3_COUNT + 1))
    elif [[ "$LAYER" == "LAYER_4_HIGH_IMPACT" ]]; then
        echo -e "${GREEN}  ✅ $NAME: Layer 4 (High-Impact)${NC}"
        LAYER_4_COUNT=$((LAYER_4_COUNT + 1))
    fi
done

echo -e "${CYAN}Cross-layer batch composition: Layer 3: $LAYER_3_COUNT, Layer 4: $LAYER_4_COUNT${NC}"

# Check if modules are blocked
echo -e "\n${BLUE}🔍 Checking if target modules are blocked...${NC}"
BLOCKED_COUNT=0
for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    module_response=$(api_call "GET" "/api/admin/orchestration/modules/$MODULE_ID" "Authorization: Bearer $TOKEN")
    IS_BLOCKED=$(parse_json "$module_response" "d['module']['is_blocked']")
    
    if [[ "$IS_BLOCKED" == "True" ]]; then
        BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    fi
done

if [[ $BLOCKED_COUNT -gt 0 ]]; then
    echo -e "${RED}❌ $BLOCKED_COUNT module(s) are blocked${NC}"
    exit 1
fi
echo -e "${GREEN}✅ No modules are blocked (0/6)${NC}"

echo -e "\n${GREEN}✅ STEP 0 COMPLETE: All pre-checks passed${NC}"

# ==================== STEP 3: STAGE PROMOTION ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 3: STAGE PROMOTION - TIER 3 CROSS-LAYER PROTOCOL${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PROMOTION_SUCCESS=0

promote_module() {
    local module_id="$1"
    local module_name="$2"
    local current_stage="$3"
    local target_stage="$4"
    local reason="$5"
    
    echo -e "\n${BLUE}📈 Promoting $module_name: $current_stage → $target_stage${NC}"
    
    promotion_data="{
        \"to_stage\": \"$target_stage\",
        \"reason\": \"$reason\",
        \"override\": true
    }"
    
    promotion_response=$(api_call "POST" "/api/admin/orchestration/modules/$module_id/stage" "Authorization: Bearer $TOKEN" "$promotion_data")
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Promotion failed${NC}"
        return 1
    fi
    
    success=$(parse_json "$promotion_response" "d.get('success', False)")
    if [[ "$success" == "True" ]]; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Get current stages first
echo -e "\n${BLUE}Fetching current stages...${NC}"
SISTER_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$SISTER_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
BROTHER_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$BROTHER_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
SAFE_PLACES_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$SAFE_PLACES_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
CIRCLES_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$CIRCLES_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
AI_MENTOR_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$AI_MENTOR_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
COMMUNITY_AI_STAGE=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$COMMUNITY_AI_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")

echo -e "${CYAN}Current stages fetched successfully${NC}"

# Promote modules
promote_module "$SISTER_ID" "Sister Network" "$SISTER_STAGE" "IN_DEV" "$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 3 Social expansion." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
promote_module "$BROTHER_ID" "Brother Network" "$BROTHER_STAGE" "IN_DEV" "$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 3 Social expansion." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
promote_module "$SAFE_PLACES_ID" "Safe Places" "$SAFE_PLACES_STAGE" "IN_DEV" "$CORRELATION_ID: Tier 3 cross-layer rollout. High-risk Layer 3 Social module." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
promote_module "$CIRCLES_ID" "Circles" "$CIRCLES_STAGE" "FULL_LAUNCH" "$CORRELATION_ID: Tier 3 cross-layer rollout. Circles promotion to FULL_LAUNCH." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
promote_module "$AI_MENTOR_ID" "AI Mentor Suite" "$AI_MENTOR_STAGE" "IN_DEV" "$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 4 High-Impact AI." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
promote_module "$COMMUNITY_AI_ID" "Community AI" "$COMMUNITY_AI_STAGE" "IN_DEV" "$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 4 High-Impact AI." && PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))

echo -e "\n${CYAN}Batch Promotion Success: $PROMOTION_SUCCESS/6 modules${NC}"

if [[ $PROMOTION_SUCCESS -eq 6 ]]; then
    echo -e "${GREEN}✅ STEP 3 COMPLETE: All stage promotions successful${NC}"
else
    echo -e "${RED}❌ STEP 3 INCOMPLETE: Some promotions failed${NC}"
    exit 1
fi

# Get final stages
echo -e "\n${BLUE}Fetching final stages...${NC}"
SISTER_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$SISTER_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
BROTHER_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$BROTHER_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
SAFE_PLACES_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$SAFE_PLACES_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
CIRCLES_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$CIRCLES_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
AI_MENTOR_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$AI_MENTOR_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")
COMMUNITY_AI_FINAL=$(parse_json "$(api_call GET /api/admin/orchestration/modules/$COMMUNITY_AI_ID "Authorization: Bearer $TOKEN")" "d['module']['rollout_stage']")

# ==================== SUMMARY ====================
echo -e "\n${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ TIER 3 BATCH 1 ROLLOUT COMPLETE (FIXED VERSION)${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📋 Rollout Summary:${NC}"
echo -e "   Correlation ID:   ${YELLOW}$CORRELATION_ID${NC}"
echo -e "   Success Rate:     ${GREEN}$PROMOTION_SUCCESS/6 (100%)${NC}"

echo -e "\n${YELLOW}📊 Before → After:${NC}"
echo -e "${CYAN}Layer 3 Social:${NC}"
echo -e "   Sister Network:   ${YELLOW}$SISTER_STAGE → $SISTER_FINAL${NC}"
echo -e "   Brother Network:  ${YELLOW}$BROTHER_STAGE → $BROTHER_FINAL${NC}"
echo -e "   Safe Places:      ${YELLOW}$SAFE_PLACES_STAGE → $SAFE_PLACES_FINAL${NC}"
echo -e "   Circles:          ${YELLOW}$CIRCLES_STAGE → $CIRCLES_FINAL${NC}"
echo -e "${CYAN}Layer 4 High-Impact AI:${NC}"
echo -e "   AI Mentor:        ${YELLOW}$AI_MENTOR_STAGE → $AI_MENTOR_FINAL${NC}"
echo -e "   Community AI:     ${YELLOW}$COMMUNITY_AI_STAGE → $COMMUNITY_AI_FINAL${NC}"

echo -e "\n${BOLD}${GREEN}✅ Script completed successfully with no hangs${NC}"
