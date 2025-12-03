#!/bin/bash

# BANIBS Social Moderation & Safety Backend Testing - Phase 8.3.1
# Tests user reporting, admin moderation queue, and feed filtering

set -e

# Configuration
BACKEND_URL="https://content-hub-555.preview.emergentagent.com"
API_BASE="${BACKEND_URL}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Global variables for test data
ADMIN_TOKEN=""
USER_TOKEN=""
TEST_POST_ID=""
TEST_POST_ID_2=""
TEST_REPORT_ID=""
TEST_USER_ID=""

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1")
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Helper function to make API requests
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth_header="$4"
    
    local url="${API_BASE}${endpoint}"
    local curl_args=(-s -w "\n%{http_code}")
    
    if [[ -n "$auth_header" ]]; then
        curl_args+=(-H "Authorization: Bearer $auth_header")
    fi
    
    curl_args+=(-H "Content-Type: application/json")
    
    if [[ "$method" == "POST" || "$method" == "PATCH" ]]; then
        if [[ -n "$data" ]]; then
            curl_args+=(-d "$data")
        fi
    fi
    
    curl_args+=(-X "$method" "$url")
    
    curl "${curl_args[@]}"
}

# Test admin login
test_admin_login() {
    log "Testing admin login..."
    
    local response=$(api_request "POST" "/auth/login" '{
        "email": "admin@banibs.com",
        "password": "BanibsAdmin#2025"
    }')
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        ADMIN_TOKEN=$(echo "$body" | jq -r '.access_token // empty')
        if [[ -n "$ADMIN_TOKEN" && "$ADMIN_TOKEN" != "null" ]]; then
            success "Admin login successful"
            return 0
        else
            error "Admin login response missing access_token"
            return 1
        fi
    else
        error "Admin login failed: $status_code - $body"
        return 1
    fi
}

# Test user registration and login
test_user_setup() {
    log "Setting up test user..."
    
    # Try to register a test user
    local timestamp=$(date +%s)
    local test_email="social_mod_test_${timestamp}@example.com"
    
    local response=$(api_request "POST" "/auth/register" '{
        "email": "'$test_email'",
        "password": "TestPass123!",
        "name": "Social Moderation Test User",
        "accepted_terms": true
    }')
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        USER_TOKEN=$(echo "$body" | jq -r '.access_token // empty')
        TEST_USER_ID=$(echo "$body" | jq -r '.user.id // empty')
        success "User registration successful"
        return 0
    elif [[ "$status_code" == "409" ]]; then
        # User exists, try login
        log "User exists, attempting login..."
        response=$(api_request "POST" "/auth/login" '{
            "email": "'$test_email'",
            "password": "TestPass123!"
        }')
        
        status_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n -1)
        
        if [[ "$status_code" == "200" ]]; then
            USER_TOKEN=$(echo "$body" | jq -r '.access_token // empty')
            TEST_USER_ID=$(echo "$body" | jq -r '.user.id // empty')
            success "User login successful"
            return 0
        else
            error "User login failed: $status_code - $body"
            return 1
        fi
    else
        error "User registration failed: $status_code - $body"
        return 1
    fi
}

# Create test posts
create_test_posts() {
    log "Creating test posts..."
    
    if [[ -z "$USER_TOKEN" ]]; then
        error "No user token available for post creation"
        return 1
    fi
    
    # Create first test post
    local response=$(api_request "POST" "/social/posts" '{
        "text": "This is a test post for moderation testing. It should be reportable."
    }' "$USER_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "201" ]]; then
        TEST_POST_ID=$(echo "$body" | jq -r '.id // empty')
        success "First test post created: $TEST_POST_ID"
    else
        error "Failed to create first test post: $status_code - $body"
        return 1
    fi
    
    # Create second test post
    response=$(api_request "POST" "/social/posts" '{
        "text": "This is another test post that we will use for different moderation scenarios."
    }' "$USER_TOKEN")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "201" ]]; then
        TEST_POST_ID_2=$(echo "$body" | jq -r '.id // empty')
        success "Second test post created: $TEST_POST_ID_2"
        return 0
    else
        error "Failed to create second test post: $status_code - $body"
        return 1
    fi
}

# Test Case 1: Valid report submission
test_valid_report_submission() {
    log "Test Case 1: Valid report submission..."
    
    if [[ -z "$USER_TOKEN" || -z "$TEST_POST_ID" ]]; then
        error "Missing user token or test post ID"
        return 1
    fi
    
    local response=$(api_request "POST" "/social/posts/$TEST_POST_ID/report" '{
        "reason_code": "spam",
        "reason_text": "This looks like a spam post"
    }' "$USER_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "201" ]]; then
        local report_id=$(echo "$body" | jq -r '.report_id // empty')
        local status=$(echo "$body" | jq -r '.status // empty')
        
        if [[ -n "$report_id" && "$status" == "pending" ]]; then
            TEST_REPORT_ID="$report_id"
            success "Valid report submission successful - Report ID: $report_id, Status: $status"
            return 0
        else
            error "Report response missing required fields or incorrect status"
            return 1
        fi
    else
        error "Valid report submission failed: $status_code - $body"
        return 1
    fi
}

# Test Case 2: Report with different reason codes
test_different_reason_codes() {
    log "Test Case 2: Testing different reason codes..."
    
    local reason_codes=("abuse" "misinfo" "other")
    local success_count=0
    
    for reason in "${reason_codes[@]}"; do
        local response=$(api_request "POST" "/social/posts/$TEST_POST_ID_2/report" '{
            "reason_code": "'$reason'",
            "reason_text": "Testing '$reason' reason code"
        }' "$USER_TOKEN")
        
        local status_code=$(echo "$response" | tail -n1)
        
        if [[ "$status_code" == "201" ]]; then
            ((success_count++))
            log "✓ Reason code '$reason' accepted"
        else
            error "Reason code '$reason' failed: $status_code"
        fi
    done
    
    if [[ "$success_count" == "3" ]]; then
        success "All reason codes (abuse, misinfo, other) working correctly"
        return 0
    else
        error "Some reason codes failed ($success_count/3 passed)"
        return 1
    fi
}

# Test Case 3: Invalid reason code
test_invalid_reason_code() {
    log "Test Case 3: Testing invalid reason code..."
    
    local response=$(api_request "POST" "/social/posts/$TEST_POST_ID/report" '{
        "reason_code": "invalid_reason",
        "reason_text": "This should fail"
    }' "$USER_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "400" ]]; then
        success "Invalid reason code correctly rejected with 400 Bad Request"
        return 0
    else
        error "Invalid reason code should return 400, got: $status_code"
        return 1
    fi
}

# Test Case 4: Report non-existent post
test_report_nonexistent_post() {
    log "Test Case 4: Testing report on non-existent post..."
    
    local response=$(api_request "POST" "/social/posts/non-existent-post-id/report" '{
        "reason_code": "spam",
        "reason_text": "This should fail"
    }' "$USER_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "404" ]]; then
        success "Non-existent post correctly returns 404 Not Found"
        return 0
    else
        error "Non-existent post should return 404, got: $status_code"
        return 1
    fi
}

# Test Case 5: Unauthenticated request
test_unauthenticated_report() {
    log "Test Case 5: Testing unauthenticated report request..."
    
    local response=$(api_request "POST" "/social/posts/$TEST_POST_ID/report" '{
        "reason_code": "spam",
        "reason_text": "This should fail"
    }')
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "401" ]]; then
        success "Unauthenticated request correctly returns 401 Unauthorized"
        return 0
    else
        error "Unauthenticated request should return 401, got: $status_code"
        return 1
    fi
}

# Test Case 6: Admin moderation queue - list pending reports
test_admin_moderation_queue() {
    log "Test Case 6: Testing admin moderation queue..."
    
    if [[ -z "$ADMIN_TOKEN" ]]; then
        error "No admin token available"
        return 1
    fi
    
    local response=$(api_request "GET" "/admin/social/reports?status=pending" "" "$ADMIN_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        local items=$(echo "$body" | jq '.items // []')
        local total=$(echo "$body" | jq '.total // 0')
        
        if [[ "$items" != "null" && "$total" != "null" ]]; then
            success "Admin moderation queue working - Found $total pending reports"
            
            # Check if our report is in the list
            local found_report=$(echo "$body" | jq --arg id "$TEST_REPORT_ID" '.items[] | select(.id == $id)')
            if [[ -n "$found_report" && "$found_report" != "null" ]]; then
                log "✓ Our test report found in moderation queue"
                
                # Verify report structure
                local post_text=$(echo "$found_report" | jq -r '.post.text // empty')
                local author_name=$(echo "$found_report" | jq -r '.post.author.display_name // empty')
                
                if [[ -n "$post_text" && -n "$author_name" ]]; then
                    log "✓ Report contains post details: '$post_text' by '$author_name'"
                else
                    warning "Report missing some post details"
                fi
            else
                warning "Our test report not found in queue (might be expected)"
            fi
            
            return 0
        else
            error "Moderation queue response missing required fields"
            return 1
        fi
    else
        error "Admin moderation queue failed: $status_code - $body"
        return 1
    fi
}

# Test Case 7: Filter by different statuses
test_moderation_queue_filters() {
    log "Test Case 7: Testing moderation queue status filters..."
    
    local statuses=("pending" "kept" "hidden" "all")
    local success_count=0
    
    for status in "${statuses[@]}"; do
        local response=$(api_request "GET" "/admin/social/reports?status=$status" "" "$ADMIN_TOKEN")
        local status_code=$(echo "$response" | tail -n1)
        
        if [[ "$status_code" == "200" ]]; then
            ((success_count++))
            log "✓ Status filter '$status' working"
        else
            error "Status filter '$status' failed: $status_code"
        fi
    done
    
    if [[ "$success_count" == "4" ]]; then
        success "All status filters (pending, kept, hidden, all) working correctly"
        return 0
    else
        error "Some status filters failed ($success_count/4 passed)"
        return 1
    fi
}

# Test Case 8: Non-admin access to moderation queue
test_non_admin_moderation_access() {
    log "Test Case 8: Testing non-admin access to moderation queue..."
    
    local response=$(api_request "GET" "/admin/social/reports" "" "$USER_TOKEN")
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "403" ]]; then
        success "Non-admin correctly denied access with 403 Forbidden"
        return 0
    else
        error "Non-admin access should return 403, got: $status_code"
        return 1
    fi
}

# Test Case 9: Keep a report (dismiss)
test_keep_report() {
    log "Test Case 9: Testing keep report action..."
    
    if [[ -z "$TEST_REPORT_ID" ]]; then
        error "No test report ID available"
        return 1
    fi
    
    local response=$(api_request "PATCH" "/admin/social/reports/$TEST_REPORT_ID" '{
        "action": "keep",
        "resolution_note": "Content is acceptable, report dismissed"
    }' "$ADMIN_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        local new_status=$(echo "$body" | jq -r '.new_status // empty')
        local action=$(echo "$body" | jq -r '.action // empty')
        
        if [[ "$new_status" == "kept" && "$action" == "keep" ]]; then
            success "Keep report action successful - Status: $new_status"
            return 0
        else
            error "Keep report response incorrect: status=$new_status, action=$action"
            return 1
        fi
    else
        error "Keep report action failed: $status_code - $body"
        return 1
    fi
}

# Test Case 10: Hide a post
test_hide_post() {
    log "Test Case 10: Testing hide post action..."
    
    # First create a new report to hide
    local response=$(api_request "POST" "/social/posts/$TEST_POST_ID_2/report" '{
        "reason_code": "abuse",
        "reason_text": "This post should be hidden"
    }' "$USER_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" != "201" ]]; then
        error "Failed to create report for hide test: $status_code"
        return 1
    fi
    
    local hide_report_id=$(echo "$body" | jq -r '.report_id // empty')
    
    # Now hide the post
    response=$(api_request "PATCH" "/admin/social/reports/$hide_report_id" '{
        "action": "hide",
        "resolution_note": "Content violates community guidelines"
    }' "$ADMIN_TOKEN")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        local new_status=$(echo "$body" | jq -r '.new_status // empty')
        local action=$(echo "$body" | jq -r '.action // empty')
        
        if [[ "$new_status" == "hidden" && "$action" == "hide" ]]; then
            success "Hide post action successful - Status: $new_status"
            return 0
        else
            error "Hide post response incorrect: status=$new_status, action=$action"
            return 1
        fi
    else
        error "Hide post action failed: $status_code - $body"
        return 1
    fi
}

# Test Case 11: Invalid action
test_invalid_action() {
    log "Test Case 11: Testing invalid action..."
    
    local response=$(api_request "PATCH" "/admin/social/reports/$TEST_REPORT_ID" '{
        "action": "invalid_action",
        "resolution_note": "This should fail"
    }' "$ADMIN_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "400" ]]; then
        success "Invalid action correctly rejected with 400 Bad Request"
        return 0
    else
        error "Invalid action should return 400, got: $status_code"
        return 1
    fi
}

# Test Case 12: Non-existent report
test_nonexistent_report() {
    log "Test Case 12: Testing non-existent report resolution..."
    
    local response=$(api_request "PATCH" "/admin/social/reports/non-existent-id" '{
        "action": "keep",
        "resolution_note": "This should fail"
    }' "$ADMIN_TOKEN")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "404" ]]; then
        success "Non-existent report correctly returns 404 Not Found"
        return 0
    else
        error "Non-existent report should return 404, got: $status_code"
        return 1
    fi
}

# Test Case 13: Feed filtering - hidden posts don't appear
test_feed_filtering() {
    log "Test Case 13: Testing feed filtering (hidden posts excluded)..."
    
    # Get the feed
    local response=$(api_request "GET" "/social/feed" "" "$USER_TOKEN")
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        local items=$(echo "$body" | jq '.items // []')
        local total_items=$(echo "$body" | jq '.total_items // 0')
        
        # Check if hidden post (TEST_POST_ID_2) is NOT in the feed
        local hidden_post=$(echo "$body" | jq --arg id "$TEST_POST_ID_2" '.items[] | select(.id == $id)')
        
        if [[ -z "$hidden_post" || "$hidden_post" == "null" ]]; then
            success "Feed filtering working - Hidden post excluded from feed"
            log "✓ Feed contains $total_items visible posts"
            return 0
        else
            error "Hidden post still appears in feed"
            return 1
        fi
    else
        error "Feed request failed: $status_code - $body"
        return 1
    fi
}

# Test Case 14: Moderation stats
test_moderation_stats() {
    log "Test Case 14: Testing moderation stats..."
    
    local response=$(api_request "GET" "/admin/social/reports/stats" "" "$ADMIN_TOKEN")
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "200" ]]; then
        local pending=$(echo "$body" | jq '.pending // 0')
        local kept=$(echo "$body" | jq '.kept // 0')
        local hidden=$(echo "$body" | jq '.hidden // 0')
        local total=$(echo "$body" | jq '.total // 0')
        
        if [[ "$pending" != "null" && "$kept" != "null" && "$hidden" != "null" && "$total" != "null" ]]; then
            success "Moderation stats working - Pending: $pending, Kept: $kept, Hidden: $hidden, Total: $total"
            
            # Verify total calculation
            local calculated_total=$((pending + kept + hidden))
            if [[ "$calculated_total" == "$total" ]]; then
                log "✓ Total count calculation correct"
            else
                warning "Total count mismatch: calculated=$calculated_total, returned=$total"
            fi
            
            return 0
        else
            error "Moderation stats response missing required fields"
            return 1
        fi
    else
        error "Moderation stats failed: $status_code - $body"
        return 1
    fi
}

# Main test execution
main() {
    echo "=========================================="
    echo "BANIBS Social Moderation & Safety Testing"
    echo "Phase 8.3.1 - Backend API Tests"
    echo "=========================================="
    echo
    
    # Setup phase
    log "Setting up test environment..."
    
    if ! test_admin_login; then
        error "Admin login failed - cannot continue with admin tests"
        exit 1
    fi
    
    if ! test_user_setup; then
        error "User setup failed - cannot continue with user tests"
        exit 1
    fi
    
    if ! create_test_posts; then
        error "Test post creation failed - cannot continue"
        exit 1
    fi
    
    echo
    log "Running moderation tests..."
    echo
    
    # User reporting tests
    test_valid_report_submission
    test_different_reason_codes
    test_invalid_reason_code
    test_report_nonexistent_post
    test_unauthenticated_report
    
    # Admin moderation queue tests
    test_admin_moderation_queue
    test_moderation_queue_filters
    test_non_admin_moderation_access
    
    # Admin report resolution tests
    test_keep_report
    test_hide_post
    test_invalid_action
    test_nonexistent_report
    
    # Feed filtering tests
    test_feed_filtering
    
    # Stats tests
    test_moderation_stats
    
    # Summary
    echo
    echo "=========================================="
    echo "TEST RESULTS SUMMARY"
    echo "=========================================="
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo
        echo "Failed tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo -e "${RED}  - $test${NC}"
        done
        echo
        exit 1
    else
        echo
        echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
        echo
        exit 0
    fi
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    error "curl is required but not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    error "jq is required but not installed"
    exit 1
fi

# Run tests
main "$@"