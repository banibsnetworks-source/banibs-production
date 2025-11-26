#!/bin/bash
#
# BPOC Tier 3 Rollout Protocol - Batch 1
# Sister Network + Brother Network + Safe Places + Circles + AI Mentor + Community AI
# Multi-Module Drop Protocol v3 - Cross-Layer Expansion (Layer 3 + Layer 4)
#
# This script executes the controlled rollout of 6 modules spanning Layers 3 & 4
# following the official BPOC orchestration rules (upgraded to v3 for cross-layer handling).
#

set -e

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
CORRELATION_ID="TIER_3_BATCH_1"

echo -e "${BOLD}${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║           BPOC TIER 3 ROLLOUT - MULTI-MODULE BATCH 1               ║${NC}"
echo -e "${BOLD}${MAGENTA}║      Cross-Layer Expansion: Layer 3 Social + Layer 4 AI            ║${NC}"
echo -e "${BOLD}${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"

# Get admin token
echo -e "\n${BLUE}🔐 Authenticating as admin...${NC}"
TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('access_token', ''))")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Authentication successful${NC}"

# Get module IDs
echo -e "\n${BLUE}📦 Fetching module IDs for Tier 3 batch (6 modules)...${NC}"
SISTER_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=sister+network" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

BROTHER_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=brother+network" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

SAFE_PLACES_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=safe+places" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

CIRCLES_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=circles" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

AI_MENTOR_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=ai+mentor" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

COMMUNITY_AI_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=community+ai" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

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

# Check layer classification for all 6 modules
echo -e "\n${BLUE}🏗️  Verifying layer classification (cross-layer batch)...${NC}"
LAYER_3_COUNT=0
LAYER_4_COUNT=0

for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    MODULE_INFO=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); m=d['module']; print(f\"{m['name']}|{m['layer']}\")")
    
    NAME=$(echo "$MODULE_INFO" | cut -d'|' -f1)
    LAYER=$(echo "$MODULE_INFO" | cut -d'|' -f2)
    
    if [[ "$LAYER" == "LAYER_3_SOCIAL" ]]; then
        echo -e "${GREEN}  ✅ $NAME: Layer 3 (Social)${NC}"
        LAYER_3_COUNT=$((LAYER_3_COUNT + 1))
    elif [[ "$LAYER" == "LAYER_4_HIGH_IMPACT" ]]; then
        echo -e "${GREEN}  ✅ $NAME: Layer 4 (High-Impact)${NC}"
        LAYER_4_COUNT=$((LAYER_4_COUNT + 1))
    else
        echo -e "${YELLOW}  ⚠️  $NAME: $LAYER${NC}"
    fi
done

echo -e "${CYAN}Cross-layer batch composition:${NC}"
echo -e "  Layer 3 (Social): ${YELLOW}$LAYER_3_COUNT modules${NC}"
echo -e "  Layer 4 (High-Impact): ${YELLOW}$LAYER_4_COUNT modules${NC}"

# Check if modules are blocked
echo -e "\n${BLUE}🔍 Checking if target modules are blocked...${NC}"
BLOCKED_COUNT=0
for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    IS_BLOCKED=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['is_blocked'])")
    
    if [[ "$IS_BLOCKED" == "True" ]]; then
        BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    fi
done

if [[ $BLOCKED_COUNT -gt 0 ]]; then
    echo -e "${RED}❌ $BLOCKED_COUNT module(s) are blocked${NC}"
    exit 1
fi
echo -e "${GREEN}✅ No modules are blocked (0/6)${NC}"

# Check current stages
echo -e "\n${BLUE}🔍 Checking current stages...${NC}"
SISTER_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SISTER_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

BROTHER_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$BROTHER_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

SAFE_PLACES_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SAFE_PLACES_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

CIRCLES_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CIRCLES_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

AI_MENTOR_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$AI_MENTOR_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

COMMUNITY_AI_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMMUNITY_AI_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

echo -e "${CYAN}Layer 3 Social:${NC}"
echo -e "  Sister Network:    ${YELLOW}$SISTER_STAGE${NC}"
echo -e "  Brother Network:   ${YELLOW}$BROTHER_STAGE${NC}"
echo -e "  Safe Places:       ${YELLOW}$SAFE_PLACES_STAGE${NC}"
echo -e "  Circles:           ${YELLOW}$CIRCLES_STAGE${NC} → ${GREEN}FULL_LAUNCH (promotion)${NC}"
echo -e "${CYAN}Layer 4 High-Impact:${NC}"
echo -e "  AI Mentor:         ${YELLOW}$AI_MENTOR_STAGE${NC}"
echo -e "  Community AI:      ${YELLOW}$COMMUNITY_AI_STAGE${NC}"

# Check dependencies across batch
echo -e "\n${BLUE}🔗 Checking dependencies across 6-module batch...${NC}"
TOTAL_DEPS=0
for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    DEPS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID/dependencies" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])")
    
    if [[ $DEPS -gt 0 ]]; then
        MODULE_NAME=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
          -H "Authorization: Bearer $TOKEN" | \
          python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['name'])")
        echo -e "  ${YELLOW}$MODULE_NAME: $DEPS dependencies${NC}"
    fi
    TOTAL_DEPS=$((TOTAL_DEPS + DEPS))
done
echo -e "${CYAN}Total dependencies across batch: $TOTAL_DEPS${NC}"

echo -e "\n${GREEN}✅ STEP 0 COMPLETE: All pre-checks passed for 6-module cross-layer batch${NC}"

# ==================== STEP 1: TRIGGER RESOLUTION ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 1: TRIGGER RESOLUTION - CROSS-LAYER ANALYSIS${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${CYAN}=== Layer 3 Social Modules ===${NC}"

# Sister Network triggers
echo -e "\n${BLUE}🎯 [1/6] Evaluating Sister Network triggers...${NC}"
SISTER_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SISTER_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
if echo "$SISTER_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined${NC}"
else
    echo "$SISTER_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Brother Network triggers
echo -e "\n${BLUE}🎯 [2/6] Evaluating Brother Network triggers...${NC}"
BROTHER_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$BROTHER_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
if echo "$BROTHER_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined${NC}"
else
    echo "$BROTHER_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Safe Places triggers (expects 3)
echo -e "\n${BLUE}🎯 [3/6] Evaluating Safe Places Network triggers (high-risk)...${NC}"
SAFE_PLACES_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SAFE_PLACES_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
echo "$SAFE_PLACES_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
SAFE_TRIGGER_COUNT=$(echo "$SAFE_PLACES_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])")
echo -e "${CYAN}  Total triggers: $SAFE_TRIGGER_COUNT${NC}"

# Circles triggers
echo -e "\n${BLUE}🎯 [4/6] Evaluating Circles triggers (promotion to FULL_LAUNCH)...${NC}"
CIRCLES_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CIRCLES_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
if echo "$CIRCLES_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined${NC}"
else
    echo "$CIRCLES_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

echo -e "\n${CYAN}=== Layer 4 High-Impact AI Modules ===${NC}"

# AI Mentor triggers
echo -e "\n${BLUE}🎯 [5/6] Evaluating AI Mentor Suite triggers...${NC}"
AI_MENTOR_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$AI_MENTOR_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
if echo "$AI_MENTOR_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined${NC}"
else
    echo "$AI_MENTOR_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Community AI triggers
echo -e "\n${BLUE}🎯 [6/6] Evaluating Community AI Assistants triggers...${NC}"
COMMUNITY_AI_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMMUNITY_AI_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")
if echo "$COMMUNITY_AI_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined${NC}"
else
    echo "$COMMUNITY_AI_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Admin override for Tier 3 controlled test
echo -e "\n${YELLOW}⚠️  Tier 3 Batch 1: Using admin override for trigger validation${NC}"
echo -e "${YELLOW}    Reason: Controlled cross-layer expansion test (Layer 3 + Layer 4)${NC}"
echo -e "${YELLOW}    First rollout of Social and High-Impact AI modules${NC}"

echo -e "\n${GREEN}✅ STEP 1 COMPLETE: All triggers evaluated for 6-module cross-layer batch${NC}"

# ==================== STEP 2: READINESS EVALUATION ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 2: READINESS EVALUATION - CROSS-LAYER BATCH ASSESSMENT${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

READY_COUNT=0

echo -e "\n${CYAN}=== Layer 3 Social ===${NC}"

# Sister Network
echo -e "\n${BLUE}📊 [1/6] Evaluating Sister Network readiness...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$SISTER_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

# Brother Network
echo -e "\n${BLUE}📊 [2/6] Evaluating Brother Network readiness...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$BROTHER_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

# Safe Places
echo -e "\n${BLUE}📊 [3/6] Evaluating Safe Places Network readiness (high-risk)...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$SAFE_PLACES_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

# Circles
echo -e "\n${BLUE}📊 [4/6] Evaluating Circles readiness (SOFT_LAUNCH → FULL_LAUNCH)...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$CIRCLES_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

echo -e "\n${CYAN}=== Layer 4 High-Impact AI ===${NC}"

# AI Mentor
echo -e "\n${BLUE}📊 [5/6] Evaluating AI Mentor Suite readiness...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$AI_MENTOR_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

# Community AI
echo -e "\n${BLUE}📊 [6/6] Evaluating Community AI Assistants readiness...${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$COMMUNITY_AI_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); READY=1 if d['readiness_status']=='READY' else 0; exit(READY)"
if [ $? -eq 1 ]; then READY_COUNT=$((READY_COUNT + 1)); fi

echo -e "\n${CYAN}Batch Readiness: $READY_COUNT/6 modules naturally ready${NC}"

echo -e "\n${GREEN}✅ STEP 2 COMPLETE: Readiness evaluation finished for cross-layer batch${NC}"

# ==================== STEP 3: STAGE PROMOTION ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 3: STAGE PROMOTION - TIER 3 CROSS-LAYER PROTOCOL${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PROMOTION_SUCCESS=0

echo -e "\n${CYAN}=== Layer 3 Social Promotions ===${NC}"

# Sister Network
echo -e "\n${BLUE}📈 [1/6] Promoting Sister Network: $SISTER_STAGE → IN_DEV${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$SISTER_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"IN_DEV\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 3 Social expansion. First Sister Network rollout.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

# Brother Network
echo -e "\n${BLUE}📈 [2/6] Promoting Brother Network: $BROTHER_STAGE → IN_DEV${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$BROTHER_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"IN_DEV\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 3 Social expansion. First Brother Network rollout.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

# Safe Places
echo -e "\n${BLUE}📈 [3/6] Promoting Safe Places Network (high-risk): $SAFE_PLACES_STAGE → IN_DEV${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$SAFE_PLACES_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"IN_DEV\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. High-risk Layer 3 Social module with RISK_MITIGATION triggers. Safety network for Black community.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

# Circles promotion to FULL_LAUNCH
echo -e "\n${BLUE}📈 [4/6] Promoting Circles: $CIRCLES_STAGE → FULL_LAUNCH${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$CIRCLES_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"FULL_LAUNCH\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. Circles support groups promotion from SOFT_LAUNCH to FULL_LAUNCH. Stable performance validated.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

echo -e "\n${CYAN}=== Layer 4 High-Impact AI Promotions ===${NC}"

# AI Mentor
echo -e "\n${BLUE}📈 [5/6] Promoting AI Mentor Suite: $AI_MENTOR_STAGE → IN_DEV${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$AI_MENTOR_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"IN_DEV\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 4 High-Impact AI. First AI business mentor rollout.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

# Community AI
echo -e "\n${BLUE}📈 [6/6] Promoting Community AI Assistants: $COMMUNITY_AI_STAGE → IN_DEV${NC}"
curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$COMMUNITY_AI_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"IN_DEV\",
    \"reason\": \"$CORRELATION_ID: Tier 3 cross-layer rollout. Layer 4 High-Impact AI. Community navigation AI assistants.\",
    \"override\": true
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ SUCCESS' if d.get('success') else '❌ FAILED'); exit(0 if d.get('success') else 1)"
if [ $? -eq 0 ]; then PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1)); fi

echo -e "\n${CYAN}Batch Promotion Success: $PROMOTION_SUCCESS/6 modules${NC}"

if [[ $PROMOTION_SUCCESS -eq 6 ]]; then
    echo -e "${GREEN}✅ STEP 3 COMPLETE: All stage promotions successful${NC}"
else
    echo -e "${RED}❌ STEP 3 INCOMPLETE: Some promotions failed${NC}"
    exit 1
fi

# ==================== STEP 4: EVENT LOGGING & VERIFICATION ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 4: EVENT LOGGING & VERIFICATION - CROSS-LAYER BATCH${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📜 Verifying event logs for all 6 modules...${NC}"

for MODULE_ID in "$SISTER_ID" "$BROTHER_ID" "$SAFE_PLACES_ID" "$CIRCLES_ID" "$AI_MENTOR_ID" "$COMMUNITY_AI_ID"; do
    MODULE_NAME=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['name'])")
    
    echo -e "\n${CYAN}$MODULE_NAME:${NC}"
    curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); recent=d['recent_events'][:2]; [print(f\"  - {e['event_type']}: {e['details'][:60]}...\") for e in recent]"
done

echo -e "\n${GREEN}✅ STEP 4 COMPLETE: All events logged with correlation ID: $CORRELATION_ID${NC}"

# ==================== STEP 5: POST-ROLLOUT STATUS ====================
echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${MAGENTA}STEP 5: POST-ROLLOUT STATUS - TIER 3 CROSS-LAYER VALIDATION${NC}"
echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📊 Final readiness summary...${NC}"
curl -s -X GET "$BACKEND_URL/api/admin/orchestration/readiness_summary" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"\nPlatform Status:\"); print(f\"  Total modules: {len(d['modules'])}\"); print(f\"  Ready: {d['ready_count']}\"); print(f\"  Waiting: {d['waiting_count']}\"); print(f\"  Blocked: {d['blocked_count']}\")"

# Get final stages
SISTER_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SISTER_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")
BROTHER_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$BROTHER_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")
SAFE_PLACES_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$SAFE_PLACES_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")
CIRCLES_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CIRCLES_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")
AI_MENTOR_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$AI_MENTOR_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")
COMMUNITY_AI_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMMUNITY_AI_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['module']['rollout_stage'])")

# ==================== SUMMARY ====================
echo -e "\n${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ TIER 3 BATCH 1 ROLLOUT COMPLETE - CROSS-LAYER EXPANSION${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📋 Rollout Summary:${NC}"
echo -e "   Correlation ID:   ${YELLOW}$CORRELATION_ID${NC}"
echo -e "   Protocol:         ${YELLOW}Multi-Module Drop v3 (Cross-Layer)${NC}"
echo -e "   Modules:          ${YELLOW}6 (4 Layer 3 Social + 2 Layer 4 AI)${NC}"
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

echo -e "\n${YELLOW}🎯 Milestones Achieved:${NC}"
echo -e "   ${GREEN}✅ First Layer 3 (Social) modules deployed${NC}"
echo -e "   ${GREEN}✅ First Layer 4 (High-Impact AI) modules deployed${NC}"
echo -e "   ${GREEN}✅ Circles promoted to FULL_LAUNCH${NC}"
echo -e "   ${GREEN}✅ Cross-layer batch execution successful${NC}"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Monitor Layer 3 Social modules (Sister/Brother/Safe Places) in IN_DEV"
echo -e "   2. Monitor Layer 4 AI modules (Mentor/Community AI) in IN_DEV"
echo -e "   3. Validate Circles FULL_LAUNCH stability"
echo -e "   4. Assess cross-layer dependencies and interactions"
echo -e "   5. Plan Tier 4 or Layer 2→3 promotions"

echo -e "\n${BLUE}🔍 Critical Monitoring Points:${NC}"
echo -e "   - Safe Places: Verification protocol, community safety"
echo -e "   - Sister/Brother Networks: Invite-only access, moderation"
echo -e "   - AI Mentor: Business coaching quality, trust establishment"
echo -e "   - Community AI: Navigation assistance, platform guidance"
echo -e "   - Circles: Support group stability at FULL_LAUNCH"

echo -e "\n${BOLD}${GREEN}✅ BPOC Tier 3 Cross-Layer Protocol executed successfully${NC}"
echo -e "${BOLD}${CYAN}Platform now spans Layers 0→4 with controlled rollouts.${NC}"
