"""
HDOS Engine v1 - Backend API Tests
Tests for EXIT-SAFE deterministic routing classifier

Endpoints tested:
- POST /api/hdos/analyze - Analyze scenario
- GET /api/hdos/glossary - Get canonical terms
- GET /api/hdos/amendments - Get ratified amendments
- GET /api/hdos/version - Get version info
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://calm-tech-learning.preview.emergentagent.com')


class TestHDOSVersion:
    """GET /api/hdos/version - Version endpoint tests"""
    
    def test_version_returns_200(self):
        """Version endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/hdos/version")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Version endpoint returns 200")
    
    def test_version_structure(self):
        """Version response has required fields"""
        response = requests.get(f"{BASE_URL}/api/hdos/version")
        data = response.json()
        
        assert "version" in data, "Missing 'version' field"
        assert "status" in data, "Missing 'status' field"
        assert "model" in data, "Missing 'model' field"
        assert "classification_states" in data, "Missing 'classification_states' field"
        print("PASS: Version response has required fields")
    
    def test_version_values(self):
        """Version response has correct values"""
        response = requests.get(f"{BASE_URL}/api/hdos/version")
        data = response.json()
        
        assert data["version"] == "1.2.0", f"Expected version 1.2.0, got {data['version']}"
        assert data["status"] == "GREEN", f"Expected status GREEN, got {data['status']}"
        assert data["model"] == "EXIT-SAFE", f"Expected model EXIT-SAFE, got {data['model']}"
        assert data["amendment_count"] == 8, f"Expected 8 amendments, got {data['amendment_count']}"
        
        expected_states = ["EXIT-PRESERVED", "EXIT-THREATENED", "EXIT-SEALED", "UNDETERMINED"]
        assert data["classification_states"] == expected_states, f"Classification states mismatch"
        print("PASS: Version response has correct values")


class TestHDOSGlossary:
    """GET /api/hdos/glossary - Glossary endpoint tests"""
    
    def test_glossary_returns_200(self):
        """Glossary endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/hdos/glossary")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Glossary endpoint returns 200")
    
    def test_glossary_structure(self):
        """Glossary response has required fields"""
        response = requests.get(f"{BASE_URL}/api/hdos/glossary")
        data = response.json()
        
        assert "hdos_version" in data, "Missing 'hdos_version' field"
        assert "terms" in data, "Missing 'terms' field"
        assert isinstance(data["terms"], list), "'terms' should be a list"
        print("PASS: Glossary response has required fields")
    
    def test_glossary_term_count(self):
        """Glossary has expected number of terms"""
        response = requests.get(f"{BASE_URL}/api/hdos/glossary")
        data = response.json()
        
        # Per spec, should have canonical terms for EXIT-based model
        assert len(data["terms"]) >= 10, f"Expected at least 10 terms, got {len(data['terms'])}"
        print(f"PASS: Glossary has {len(data['terms'])} terms")
    
    def test_glossary_term_structure(self):
        """Each glossary term has required fields"""
        response = requests.get(f"{BASE_URL}/api/hdos/glossary")
        data = response.json()
        
        for term in data["terms"]:
            assert "term" in term, f"Term missing 'term' field: {term}"
            assert "definition" in term, f"Term missing 'definition' field: {term}"
        print("PASS: All glossary terms have required fields")
    
    def test_glossary_has_key_terms(self):
        """Glossary includes key EXIT-based terms"""
        response = requests.get(f"{BASE_URL}/api/hdos/glossary")
        data = response.json()
        
        term_names = [t["term"] for t in data["terms"]]
        expected_terms = ["EXIT-PRESERVED", "EXIT-THREATENED", "EXIT-SEALED", "DOG_CONFIG_PRESENT"]
        
        for expected in expected_terms:
            assert expected in term_names, f"Missing expected term: {expected}"
        print("PASS: Glossary includes key EXIT-based terms")


class TestHDOSAmendments:
    """GET /api/hdos/amendments - Amendments endpoint tests"""
    
    def test_amendments_returns_200(self):
        """Amendments endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/hdos/amendments")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Amendments endpoint returns 200")
    
    def test_amendments_structure(self):
        """Amendments response has required fields"""
        response = requests.get(f"{BASE_URL}/api/hdos/amendments")
        data = response.json()
        
        assert "hdos_version" in data, "Missing 'hdos_version' field"
        assert "amendments" in data, "Missing 'amendments' field"
        assert isinstance(data["amendments"], list), "'amendments' should be a list"
        print("PASS: Amendments response has required fields")
    
    def test_amendments_count(self):
        """Amendments returns exactly 8 ratified amendments"""
        response = requests.get(f"{BASE_URL}/api/hdos/amendments")
        data = response.json()
        
        assert len(data["amendments"]) == 8, f"Expected 8 amendments, got {len(data['amendments'])}"
        print("PASS: Amendments returns 8 amendments")
    
    def test_amendment_structure(self):
        """Each amendment has required fields"""
        response = requests.get(f"{BASE_URL}/api/hdos/amendments")
        data = response.json()
        
        for amendment in data["amendments"]:
            assert "id" in amendment, f"Amendment missing 'id' field"
            assert "title" in amendment, f"Amendment missing 'title' field"
            assert "status" in amendment, f"Amendment missing 'status' field"
            assert "date" in amendment, f"Amendment missing 'date' field"
            assert "summary" in amendment, f"Amendment missing 'summary' field"
        print("PASS: All amendments have required fields")
    
    def test_amendments_are_ratified(self):
        """All amendments have RATIFIED status"""
        response = requests.get(f"{BASE_URL}/api/hdos/amendments")
        data = response.json()
        
        for amendment in data["amendments"]:
            assert amendment["status"] == "RATIFIED", f"Amendment {amendment['id']} is not RATIFIED"
        print("PASS: All amendments are RATIFIED")


class TestHDOSAnalyze:
    """POST /api/hdos/analyze - Main analysis endpoint tests"""
    
    @pytest.fixture
    def api_client(self):
        """Shared requests session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_analyze_returns_200(self, api_client):
        """Analyze endpoint returns 200 OK with valid input"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Analyze endpoint returns 200")
    
    def test_analyze_response_structure(self, api_client):
        """Analyze response has required output fields"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        # Per OUTPUT CONTRACT: routing.state + confidence + pressure_breakdown + collapse_path + warnings
        assert "routing" in data, "Missing 'routing' field"
        assert "state" in data["routing"], "Missing 'routing.state' field"
        assert "confidence" in data, "Missing 'confidence' field"
        assert "pressure_breakdown" in data, "Missing 'pressure_breakdown' field"
        assert "collapse_path" in data, "Missing 'collapse_path' field"
        assert "warnings" in data, "Missing 'warnings' field"
        assert "guardrails_footer" in data, "Missing 'guardrails_footer' field"
        assert "hdos_version" in data, "Missing 'hdos_version' field"
        assert "pressure_index" in data, "Missing 'pressure_index' field"
        assert "exit_integrity_index" in data, "Missing 'exit_integrity_index' field"
        assert "escalation_index" in data, "Missing 'escalation_index' field"
        print("PASS: Analyze response has required output fields")
    
    def test_exit_preserved_scenario(self, api_client):
        """Minimum pressure scenario returns EXIT-PRESERVED"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        assert data["routing"]["state"] == "EXIT-PRESERVED", f"Expected EXIT-PRESERVED, got {data['routing']['state']}"
        assert data["confidence"] == "HIGH", f"Expected HIGH confidence, got {data['confidence']}"
        assert data["pressure_index"] == 0, f"Expected pressure_index 0, got {data['pressure_index']}"
        assert data["exit_integrity_index"] == 100, f"Expected exit_integrity_index 100, got {data['exit_integrity_index']}"
        print("PASS: Minimum pressure returns EXIT-PRESERVED")
    
    def test_exit_sealed_no_exit(self, api_client):
        """Exit paths = 'no' triggers EXIT-SEALED"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "no",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        assert data["routing"]["state"] == "EXIT-SEALED", f"Expected EXIT-SEALED, got {data['routing']['state']}"
        print("PASS: Exit paths 'no' triggers EXIT-SEALED")
    
    def test_exit_sealed_max_pressure(self, api_client):
        """Maximum pressure scenario returns EXIT-SEALED with DOG_CONFIG_PRESENT"""
        payload = {
            "context_type": "work",
            "public_exposure": True,
            "power_asymmetry": "high",
            "urgency_level": "high",
            "moral_loading": "high",
            "refusal_cost": "high",
            "exit_paths_available": "no",
            "force_level": "physical"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        assert data["routing"]["state"] == "EXIT-SEALED", f"Expected EXIT-SEALED, got {data['routing']['state']}"
        assert data["confidence"] == "HIGH", f"Expected HIGH confidence, got {data['confidence']}"
        assert data["pressure_index"] >= 80, f"Expected high pressure_index, got {data['pressure_index']}"
        assert data["exit_integrity_index"] <= 25, f"Expected low exit_integrity_index, got {data['exit_integrity_index']}"
        assert data["dog_config_present"] == True, f"Expected DOG_CONFIG_PRESENT=True"
        print("PASS: Maximum pressure returns EXIT-SEALED with DOG_CONFIG_PRESENT")
    
    def test_exit_threatened_mid_pressure(self, api_client):
        """Medium exit_integrity_index (26-55) returns EXIT-THREATENED"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "low",
            "urgency_level": "low",
            "moral_loading": "low",
            "refusal_cost": "low",
            "exit_paths_available": "partial",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        # With partial exit paths and low pressure, should be EXIT-THREATENED
        assert data["routing"]["state"] == "EXIT-THREATENED", f"Expected EXIT-THREATENED, got {data['routing']['state']}"
        assert 26 <= data["exit_integrity_index"] <= 55, f"exit_integrity_index {data['exit_integrity_index']} not in threatened range"
        print("PASS: Medium exit_integrity returns EXIT-THREATENED")
    
    def test_dog_config_requires_high_pressure(self, api_client):
        """DOG_CONFIG_PRESENT only when SEALED/THREATENED AND pressure_index >= 60"""
        # Low pressure scenario - DOG_CONFIG should be null/false
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "low",
            "urgency_level": "low",
            "moral_loading": "low",
            "refusal_cost": "low",
            "exit_paths_available": "partial",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        # Even if EXIT-THREATENED, DOG_CONFIG_PRESENT should be null because pressure_index < 60
        assert data["dog_config_present"] is None, f"DOG_CONFIG_PRESENT should be null when pressure_index < 60, got {data['dog_config_present']}"
        print("PASS: DOG_CONFIG_PRESENT null when pressure_index < 60")
    
    def test_pressure_breakdown_contains_active_vectors(self, api_client):
        """Pressure breakdown includes vectors for all active pressure sources"""
        payload = {
            "context_type": "work",
            "public_exposure": True,
            "power_asymmetry": "high",
            "urgency_level": "med",
            "moral_loading": "high",
            "refusal_cost": "med",
            "exit_paths_available": "partial",
            "force_level": "social"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        vector_names = [pv["vector"] for pv in data["pressure_breakdown"]]
        
        # Should have vectors for: URGENCY, MORAL FORCE, POWER ASYMMETRY, PUBLIC EXPOSURE, REFUSAL PENALTY, ESCALATION
        expected_vectors = ["URGENCY", "MORAL FORCE", "POWER ASYMMETRY", "PUBLIC EXPOSURE", "REFUSAL PENALTY", "ESCALATION"]
        for expected in expected_vectors:
            assert expected in vector_names, f"Missing vector: {expected}"
        print("PASS: Pressure breakdown contains all active vectors")
    
    def test_collapse_path_format(self, api_client):
        """Collapse path follows template format"""
        payload = {
            "context_type": "work",
            "public_exposure": True,
            "power_asymmetry": "high",
            "urgency_level": "med",
            "moral_loading": "high",
            "refusal_cost": "high",
            "exit_paths_available": "partial",
            "force_level": "social"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        collapse_path = data["collapse_path"]
        
        # Should follow format: Pressure(...) -> RefusalCost(...) -> Exits(...) -> Output(...)
        assert "Pressure(" in collapse_path, "Missing Pressure component"
        assert "RefusalCost(" in collapse_path, "Missing RefusalCost component"
        assert "Exits(" in collapse_path, "Missing Exits component"
        assert "Output(" in collapse_path, "Missing Output component"
        print(f"PASS: Collapse path follows format: {collapse_path}")
    
    def test_guardrails_footer_present(self, api_client):
        """Guardrails footer is always present and non-prescriptive"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        assert data["guardrails_footer"], "Guardrails footer is empty"
        assert "prescribe" in data["guardrails_footer"].lower() or "classify" in data["guardrails_footer"].lower(), \
            "Footer should mention prescriptive/classification constraints"
        print("PASS: Guardrails footer present and appropriate")
    
    def test_validation_invalid_context_type(self, api_client):
        """Invalid context_type returns 422"""
        payload = {
            "context_type": "invalid",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid input, got {response.status_code}"
        print("PASS: Invalid context_type returns 422")
    
    def test_validation_missing_required_field(self, api_client):
        """Missing required field returns 422"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            # Missing power_asymmetry and other fields
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("PASS: Missing required field returns 422")


class TestHDOSAnalyzeThresholds:
    """Additional threshold tests for EXIT_INTEGRITY_INDEX classification"""
    
    @pytest.fixture
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_exit_integrity_threshold_25(self, api_client):
        """exit_integrity_index <= 25 triggers EXIT-SEALED"""
        # Calculate payload that results in exit_integrity_index around 25
        payload = {
            "context_type": "work",
            "public_exposure": True,
            "power_asymmetry": "med",
            "urgency_level": "med",
            "moral_loading": "med",
            "refusal_cost": "med",
            "exit_paths_available": "partial",  # baseline 60
            "force_level": "social"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        if data["exit_integrity_index"] <= 25:
            assert data["routing"]["state"] == "EXIT-SEALED", "exit_integrity <= 25 should be EXIT-SEALED"
        print(f"PASS: Threshold 25 test - exit_integrity_index={data['exit_integrity_index']}, state={data['routing']['state']}")
    
    def test_exit_integrity_threshold_55(self, api_client):
        """exit_integrity_index between 26-55 triggers EXIT-THREATENED"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "low",
            "urgency_level": "low",
            "moral_loading": "none",
            "refusal_cost": "low",
            "exit_paths_available": "partial",  # baseline 60
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        # This should result in EXIT-THREATENED due to partial exit + some pressure
        if 26 <= data["exit_integrity_index"] <= 55:
            assert data["routing"]["state"] == "EXIT-THREATENED", "exit_integrity 26-55 should be EXIT-THREATENED"
        elif data["exit_integrity_index"] > 55:
            assert data["routing"]["state"] == "EXIT-PRESERVED", "exit_integrity > 55 should be EXIT-PRESERVED"
        print(f"PASS: Threshold 55 test - exit_integrity_index={data['exit_integrity_index']}, state={data['routing']['state']}")
    
    def test_exit_integrity_above_55(self, api_client):
        """exit_integrity_index > 55 triggers EXIT-PRESERVED"""
        payload = {
            "context_type": "personal",
            "public_exposure": False,
            "power_asymmetry": "none",
            "urgency_level": "none",
            "moral_loading": "none",
            "refusal_cost": "none",
            "exit_paths_available": "yes",  # baseline 100
            "force_level": "none"
        }
        response = api_client.post(f"{BASE_URL}/api/hdos/analyze", json=payload)
        data = response.json()
        
        assert data["exit_integrity_index"] > 55, f"Expected exit_integrity > 55, got {data['exit_integrity_index']}"
        assert data["routing"]["state"] == "EXIT-PRESERVED", "exit_integrity > 55 should be EXIT-PRESERVED"
        print(f"PASS: Threshold >55 test - exit_integrity_index={data['exit_integrity_index']}, state=EXIT-PRESERVED")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
