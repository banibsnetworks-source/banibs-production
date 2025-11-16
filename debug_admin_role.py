#!/usr/bin/env python3
"""
Debug script to check admin user role
"""

import requests
import json

# Backend URL from frontend/.env
BACKEND_URL = "https://message-hub-335.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def test_admin_role():
    # Login as admin
    response = requests.post(f"{API_BASE}/auth/login", json={
        "email": "admin@banibs.com",
        "password": "BanibsAdmin#2025"
    })
    
    if response.status_code == 200:
        data = response.json()
        print("Login successful!")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check if we can access an admin endpoint that works
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try revenue overview (which should work)
        revenue_response = requests.get(f"{API_BASE}/admin/revenue/overview", headers=headers)
        print(f"\nRevenue overview status: {revenue_response.status_code}")
        if revenue_response.status_code != 200:
            print(f"Revenue response: {revenue_response.text}")
        
        # Try insights admin (which is failing)
        insights_response = requests.get(f"{API_BASE}/insights/admin/regional", headers=headers)
        print(f"Insights admin status: {insights_response.status_code}")
        if insights_response.status_code != 200:
            print(f"Insights response: {insights_response.text}")
            
    else:
        print(f"Login failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_admin_role()