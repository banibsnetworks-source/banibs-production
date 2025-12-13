#!/usr/bin/env python3
"""
Reading Night API Test Runner
"""

import sys
from backend_test import BanibsAPITester

def main():
    tester = BanibsAPITester()
    
    print("🎙️ Starting BANIBS Reading Night API Test Suite")
    print(f"Testing against: {tester.session.headers}")
    print("Testing Reading Night - Guided Communal Reading Experience")
    
    tests = [
        # Authentication Setup
        ("Admin Login", tester.test_admin_login),
        
        # Reading Night API Tests
        ("Reading Night Authentication", tester.test_reading_night_authentication),
        ("Reading Night Sessions List", tester.test_reading_night_sessions_list),
        ("Reading Night Session Detail", tester.test_reading_night_session_detail),
        ("Reading Night RSVP Flow", tester.test_reading_night_rsvp_flow),
        ("Reading Night My RSVPs", tester.test_reading_night_my_rsvps),
        ("Reading Night Reflection Prompts", tester.test_reading_night_reflection_prompts),
        ("Reading Night Reflection Submission", tester.test_reading_night_reflection_submission),
        ("Reading Night Admin Sessions", tester.test_reading_night_admin_sessions),
        ("Reading Night Admin Create Session", tester.test_reading_night_admin_create_session),
        ("Reading Night Admin Update Session", tester.test_reading_night_admin_update_session),
        ("Reading Night Admin Publish Session", tester.test_reading_night_admin_publish_session),
        ("Reading Night Admin Generate Audio", tester.test_reading_night_admin_generate_audio),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n--- Running {test_name} ---")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed += 1
            
    print(f"\n=== READING NIGHT TEST RESULTS ===")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Total: {passed + failed}")
    
    if failed == 0:
        print("🎉 All Reading Night tests passed!")
        return True
    else:
        print(f"💥 {failed} Reading Night test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)