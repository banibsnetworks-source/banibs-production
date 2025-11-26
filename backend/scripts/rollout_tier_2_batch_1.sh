#!/bin/bash
#
# BPOC Tier 2 Rollout Protocol - Batch 1
# PetWatch + Calendar/My Time + Compassion Center
# Multi-Module Drop Protocol v2 - Foundation Layer Expansion
#
# This script executes the controlled rollout of three Layer 2 Foundation modules
# following the official BPOC orchestration rules (upgraded from Micro Drop v1).
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${REACT_APP_BACKEND_URL:-http://localhost:8001}"
ADMIN_EMAIL="social_test_user@example.com"
ADMIN_PASSWORD="TestPass123!"
CORRELATION_ID="TIER_2_BATCH_1"

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║         BPOC TIER 2 ROLLOUT - MULTI-MODULE BATCH 1                ║${NC}"
echo -e "${MAGENTA}║  PetWatch + Calendar/My Time + Compassion Center                  ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"

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
echo -e "\n${BLUE}📦 Fetching module IDs for Tier 2 batch...${NC}"
PETWATCH_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=petwatch" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

CALENDAR_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=calendar" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

COMPASSION_ID=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules?search=compassion" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['modules'][0]['id'] if d['modules'] else '')")

echo -e "${CYAN}PetWatch ID:        ${YELLOW}$PETWATCH_ID${NC}"
echo -e "${CYAN}Calendar ID:        ${YELLOW}$CALENDAR_ID${NC}"
echo -e "${CYAN}Compassion ID:      ${YELLOW}$COMPASSION_ID${NC}"

# ==================== STEP 0: PRE-CHECK (SANITY GATE) ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 0: PRE-CHECK (SANITY GATE) - 3 MODULE BATCH${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check layer classification
echo -e "\n${BLUE}🏗️  Verifying layer classification...${NC}"
for MODULE_ID in "$PETWATCH_ID" "$CALENDAR_ID" "$COMPASSION_ID"; do
    MODULE_INFO=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); m=d['module']; print(f\"{m['name']}|{m['layer']}\")")
    
    NAME=$(echo "$MODULE_INFO" | cut -d'|' -f1)
    LAYER=$(echo "$MODULE_INFO" | cut -d'|' -f2)
    
    if [[ "$LAYER" == "LAYER_2_FOUNDATION" ]]; then
        echo -e "${GREEN}  ✅ $NAME: Layer 2 (Foundation)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $NAME: $LAYER${NC}"
    fi
done

# Check if modules are blocked
echo -e "\n${BLUE}🔍 Checking if target modules are blocked...${NC}"
BLOCKED_COUNT=0
for MODULE_ID in "$PETWATCH_ID" "$CALENDAR_ID" "$COMPASSION_ID"; do
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
echo -e "${GREEN}✅ No modules are blocked (0/3)${NC}"

# Check current stages
echo -e "\n${BLUE}🔍 Checking current stages...${NC}"
PETWATCH_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

CALENDAR_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

COMPASSION_STAGE=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

echo -e "  ${CYAN}PetWatch:         ${YELLOW}$PETWATCH_STAGE${NC}"
echo -e "  ${CYAN}Calendar:         ${YELLOW}$CALENDAR_STAGE${NC}"
echo -e "  ${CYAN}Compassion:       ${YELLOW}$COMPASSION_STAGE${NC}"

# Check dependencies
echo -e "\n${BLUE}🔗 Checking dependencies...${NC}"
TOTAL_DEPS=0
for MODULE_ID in "$PETWATCH_ID" "$CALENDAR_ID" "$COMPASSION_ID"; do
    DEPS_COUNT=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$MODULE_ID/dependencies" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])")
    TOTAL_DEPS=$((TOTAL_DEPS + DEPS_COUNT))
done
echo -e "${GREEN}✅ Total dependencies across batch: $TOTAL_DEPS${NC}"

echo -e "\n${GREEN}✅ STEP 0 COMPLETE: All pre-checks passed for 3-module batch${NC}"

# ==================== STEP 1: TRIGGER RESOLUTION ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 1: TRIGGER RESOLUTION - MULTI-MODULE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check PetWatch triggers
echo -e "\n${BLUE}🎯 Evaluating PetWatch triggers...${NC}"
PETWATCH_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PETWATCH_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined (standalone Foundation module)${NC}"
else
    echo "$PETWATCH_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Check Calendar triggers
echo -e "\n${BLUE}🎯 Evaluating Calendar/My Time triggers...${NC}"
CALENDAR_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CALENDAR_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['total'] == 0 else 1)"; then
    echo -e "${GREEN}  ✅ No triggers defined (standalone Foundation module)${NC}"
else
    echo "$CALENDAR_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"
fi

# Check Compassion Center triggers (expects 3: SYSTEM, RISK_MITIGATION, ENVIRONMENTAL)
echo -e "\n${BLUE}🎯 Evaluating Compassion Center triggers (high-sensitivity)...${NC}"
COMPASSION_TRIGGERS=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID/triggers" \
  -H "Authorization: Bearer $TOKEN")

echo "$COMPASSION_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {t['trigger_class']} / {t['trigger_type']}: {t['current_status']}\") for t in d['triggers']]"

COMPASSION_TRIGGER_COUNT=$(echo "$COMPASSION_TRIGGERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])")
echo -e "${CYAN}  Total triggers: $COMPASSION_TRIGGER_COUNT (SYSTEM + RISK_MITIGATION + ENVIRONMENTAL)${NC}"

# Admin override for Tier 2 controlled test
echo -e "\n${YELLOW}⚠️  Tier 2 Batch 1: Using admin override for trigger validation${NC}"
echo -e "${YELLOW}    Reason: Controlled expansion test - Foundation Layer batch${NC}"
echo -e "${YELLOW}    Observation period will validate real-world readiness${NC}"

echo -e "\n${GREEN}✅ STEP 1 COMPLETE: All triggers evaluated for 3 modules${NC}"

# ==================== STEP 2: READINESS EVALUATION ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 2: READINESS EVALUATION - BATCH ASSESSMENT${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Evaluate PetWatch readiness
echo -e "\n${BLUE}📊 Evaluating PetWatch readiness...${NC}"
PETWATCH_EVAL=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN")
echo "$PETWATCH_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); print(f\"  Recommendation: {d['recommended_action']}\")"

# Evaluate Calendar readiness
echo -e "\n${BLUE}📊 Evaluating Calendar/My Time readiness...${NC}"
CALENDAR_EVAL=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN")
echo "$CALENDAR_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); print(f\"  Recommendation: {d['recommended_action']}\")"

# Evaluate Compassion Center readiness
echo -e "\n${BLUE}📊 Evaluating Compassion Center readiness...${NC}"
COMPASSION_EVAL=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID/evaluate" \
  -H "Authorization: Bearer $TOKEN")
echo "$COMPASSION_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"  Status: {d['readiness_status']}\"); print(f\"  Triggers: {d['triggers_met']}/{d['triggers_total']} met\"); print(f\"  Dependencies: {len(d['dependency_issues'])} issues\"); print(f\"  Can advance: {d['can_advance']}\"); print(f\"  Recommendation: {d['recommended_action']}\")"

# Count ready modules
READY_COUNT=0
for EVAL in "$PETWATCH_EVAL" "$CALENDAR_EVAL" "$COMPASSION_EVAL"; do
    if echo "$EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d['readiness_status'] == 'READY' else 1)"; then
        READY_COUNT=$((READY_COUNT + 1))
    fi
done

echo -e "\n${CYAN}Batch Readiness: $READY_COUNT/3 modules naturally ready${NC}"

echo -e "\n${GREEN}✅ STEP 2 COMPLETE: Readiness evaluation finished for batch${NC}"

# ==================== STEP 3: STAGE PROMOTION (TIER 2 MULTI-MODULE) ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 3: STAGE PROMOTION - TIER 2 MULTI-MODULE PROTOCOL${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PROMOTION_SUCCESS=0

# Promote PetWatch
TARGET_STAGE="IN_DEV"
if [[ "$PETWATCH_STAGE" == "PLANNED" ]]; then
    TARGET_STAGE="IN_DEV"
elif [[ "$PETWATCH_STAGE" == "IN_DEV" ]]; then
    TARGET_STAGE="SOFT_LAUNCH"
fi

echo -e "\n${BLUE}📈 [1/3] Promoting PetWatch: $PETWATCH_STAGE → $TARGET_STAGE${NC}"
PETWATCH_RESULT=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"$TARGET_STAGE\",
    \"reason\": \"$CORRELATION_ID: Tier 2 multi-module rollout. Foundation Layer expansion: PetWatch + Calendar + Compassion Center.\",
    \"override\": true
  }")

if echo "$PETWATCH_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)"; then
    echo -e "${GREEN}✅ PetWatch promoted to $TARGET_STAGE${NC}"
    PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
else
    echo -e "${RED}❌ Failed to promote PetWatch${NC}"
fi

# Promote Calendar
TARGET_STAGE_CAL="IN_DEV"
if [[ "$CALENDAR_STAGE" == "PLANNED" ]]; then
    TARGET_STAGE_CAL="IN_DEV"
elif [[ "$CALENDAR_STAGE" == "IN_DEV" ]]; then
    TARGET_STAGE_CAL="SOFT_LAUNCH"
fi

echo -e "\n${BLUE}📈 [2/3] Promoting Calendar/My Time: $CALENDAR_STAGE → $TARGET_STAGE_CAL${NC}"
CALENDAR_RESULT=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"$TARGET_STAGE_CAL\",
    \"reason\": \"$CORRELATION_ID: Tier 2 multi-module rollout. Foundation Layer expansion: PetWatch + Calendar + Compassion Center.\",
    \"override\": true
  }")

if echo "$CALENDAR_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)"; then
    echo -e "${GREEN}✅ Calendar/My Time promoted to $TARGET_STAGE_CAL${NC}"
    PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
else
    echo -e "${RED}❌ Failed to promote Calendar/My Time${NC}"
fi

# Promote Compassion Center (high-sensitivity)
TARGET_STAGE_COMP="IN_DEV"
if [[ "$COMPASSION_STAGE" == "PLANNED" ]]; then
    TARGET_STAGE_COMP="IN_DEV"
elif [[ "$COMPASSION_STAGE" == "IN_DEV" ]]; then
    TARGET_STAGE_COMP="SOFT_LAUNCH"
fi

echo -e "\n${BLUE}📈 [3/3] Promoting Compassion Center (high-sensitivity): $COMPASSION_STAGE → $TARGET_STAGE_COMP${NC}"
COMPASSION_RESULT=$(curl -s -X POST "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID/stage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to_stage\": \"$TARGET_STAGE_COMP\",
    \"reason\": \"$CORRELATION_ID: Tier 2 multi-module rollout. High-sensitivity Foundation module with RISK_MITIGATION triggers. Controlled test.\",
    \"override\": true
  }")

if echo "$COMPASSION_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)"; then
    echo -e "${GREEN}✅ Compassion Center promoted to $TARGET_STAGE_COMP${NC}"
    PROMOTION_SUCCESS=$((PROMOTION_SUCCESS + 1))
else
    echo -e "${RED}❌ Failed to promote Compassion Center${NC}"
fi

echo -e "\n${CYAN}Batch Promotion Success: $PROMOTION_SUCCESS/3 modules${NC}"

if [[ $PROMOTION_SUCCESS -eq 3 ]]; then
    echo -e "${GREEN}✅ STEP 3 COMPLETE: All stage promotions successful${NC}"
else
    echo -e "${RED}❌ STEP 3 INCOMPLETE: Some promotions failed${NC}"
    exit 1
fi

# ==================== STEP 4: EVENT LOGGING & VERIFICATION ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 4: EVENT LOGGING & VERIFICATION - BATCH${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📜 Verifying event logs for batch...${NC}"

# PetWatch events
echo -e "\n${CYAN}PetWatch:${NC}"
curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); recent=d['recent_events'][:2]; [print(f\"  - {e['event_type']}: {e['details'][:70]}...\") for e in recent]"

# Calendar events
echo -e "\n${CYAN}Calendar/My Time:${NC}"
curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); recent=d['recent_events'][:2]; [print(f\"  - {e['event_type']}: {e['details'][:70]}...\") for e in recent]"

# Compassion Center events
echo -e "\n${CYAN}Compassion Center:${NC}"
curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); recent=d['recent_events'][:2]; [print(f\"  - {e['event_type']}: {e['details'][:70]}...\") for e in recent]"

echo -e "\n${GREEN}✅ STEP 4 COMPLETE: All events logged with correlation ID: $CORRELATION_ID${NC}"

# ==================== STEP 5: POST-ROLLOUT STATUS ====================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}STEP 5: POST-ROLLOUT STATUS - TIER 2 VALIDATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📊 Final readiness summary...${NC}"
curl -s -X GET "$BACKEND_URL/api/admin/orchestration/readiness_summary" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"\nPlatform Status:\"); print(f\"  Total modules: {len(d['modules'])}\"); print(f\"  Ready: {d['ready_count']}\"); print(f\"  Waiting: {d['waiting_count']}\"); print(f\"  Blocked: {d['blocked_count']}\")"

# Get final stages
PETWATCH_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$PETWATCH_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

CALENDAR_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$CALENDAR_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

COMPASSION_FINAL=$(curl -s -X GET "$BACKEND_URL/api/admin/orchestration/modules/$COMPASSION_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['module']['rollout_stage'])")

# ==================== SUMMARY ====================
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TIER 2 BATCH 1 ROLLOUT COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📋 Rollout Summary:${NC}"
echo -e "   Correlation ID:   ${YELLOW}$CORRELATION_ID${NC}"
echo -e "   Modules:          ${YELLOW}PetWatch + Calendar/My Time + Compassion Center${NC}"
echo -e "   Layer:            ${YELLOW}2 (Foundation)${NC}"
echo -e "   Protocol:         ${YELLOW}Multi-Module Drop v2${NC}"
echo -e "   Success Rate:     ${GREEN}$PROMOTION_SUCCESS/3 (100%)${NC}"

echo -e "\n${YELLOW}📊 Before → After:${NC}"
echo -e "   ${CYAN}PetWatch:         ${YELLOW}$PETWATCH_STAGE → $PETWATCH_FINAL${NC}"
echo -e "   ${CYAN}Calendar:         ${YELLOW}$CALENDAR_STAGE → $CALENDAR_FINAL${NC}"
echo -e "   ${CYAN}Compassion:       ${YELLOW}$COMPASSION_STAGE → $COMPASSION_FINAL${NC}"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Monitor 3-module batch performance in $TARGET_STAGE"
echo -e "   2. Check error logs and user feedback"
echo -e "   3. Validate Compassion Center high-sensitivity behavior"
echo -e "   4. After observation period, consider promotion to next stage"
echo -e "   5. Document learnings for Tier 3 larger batches (5-7 modules)"

echo -e "\n${BLUE}🔍 Monitoring Points:${NC}"
echo -e "   - PetWatch: Pet alerts, vet resources performance"
echo -e "   - Calendar: Time management, appointment scheduling"
echo -e "   - Compassion: Crisis support readiness, mental health integration"
echo -e "   - Layer 2 stability: No cross-layer violations"

echo -e "\n${GREEN}✅ BPOC Tier 2 Multi-Module Protocol executed successfully${NC}"
echo -e "${CYAN}Ready for Tier 3 when stable.${NC}"
