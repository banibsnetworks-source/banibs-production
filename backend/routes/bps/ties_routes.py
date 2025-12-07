"""
TIES API Routes
Version 1.0
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime
from uuid import uuid4

from models.bps.models import (
    TIESInput,
    TIESOutput,
    BPSAuditLog
)
from services.bps.ties import TIESEngine

router = APIRouter(prefix="/api/bps/ties", tags=["BPS-TIES"])

# Initialize TIES engine
ties_engine = TIESEngine()


@router.post("/analyze", response_model=TIESOutput)
async def analyze_content(input_data: TIESInput) -> TIESOutput:
    """
    Analyze content using TIES
    
    Args:
        input_data: Content and configuration for analysis
        
    Returns:
        TIES analysis result with verdict, issues, and suggested rewrites
    """
    try:
        # Run TIES analysis
        result = ties_engine.analyze(input_data)
        
        # Log to audit trail (in production, save to database)
        audit_log = BPSAuditLog(
            id=str(uuid4()),
            module="TIES",
            input_content=input_data.content[:500],  # Truncate for storage
            output=result.dict(),
            verdict=result.verdict,
            timestamp=datetime.utcnow()
        )
        
        # TODO: Save audit_log to MongoDB
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"TIES analysis failed: {str(e)}"
        )


@router.post("/validate", response_model=Dict[str, Any])
async def validate_content(input_data: TIESInput) -> Dict[str, Any]:
    """
    Quick validation endpoint - returns only pass/fail status
    
    Args:
        input_data: Content to validate
        
    Returns:
        Simple validation result
    """
    try:
        result = ties_engine.analyze(input_data)
        
        return {
            "is_valid": result.verdict == "OK",
            "verdict": result.verdict,
            "issue_count": len(result.issues),
            "critical_issues": sum(1 for issue in result.issues if issue.severity == "critical"),
            "requires_review": result.verdict in ["WARN", "BLOCK"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Validation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "module": "TIES",
        "version": "1.0",
        "phase": "1"
    }


@router.get("/config")
async def get_default_config():
    """Get default TIES configuration"""
    return ties_engine.default_facts_config.dict()
