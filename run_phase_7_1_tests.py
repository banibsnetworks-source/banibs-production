#!/usr/bin/env python3
"""
Phase 7.1 Test Runner - Jobs & Opportunities + Business Rating System
"""

from backend_test import BanibsAPITester
import sys

def main():
    """Run Phase 7.1 comprehensive tests"""
    print("🎯 BANIBS Phase 7.1: Jobs & Opportunities + Business Rating System Testing")
    print("=" * 80)
    
    tester = BanibsAPITester()
    
    try:
        success = tester.test_phase_7_1_jobs_and_ratings_comprehensive()
        
        print("\n" + "=" * 80)
        if success:
            print("🎉 PHASE 7.1 TESTING COMPLETE - ALL TESTS PASSED!")
            print("✅ Jobs System: All CRUD operations working")
            print("✅ Job Search & Filtering: Working correctly")
            print("✅ Job Applications: Create and retrieve working")
            print("✅ Business Reviews: Create, update, and retrieve working")
            print("✅ Rating Statistics: Aggregation and updates working")
            print("✅ Error Handling: Proper validation and status codes")
            return True
        else:
            print("❌ PHASE 7.1 TESTING FAILED - Some tests did not pass")
            return False
            
    except Exception as e:
        print(f"❌ PHASE 7.1 TESTING FAILED with exception: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)