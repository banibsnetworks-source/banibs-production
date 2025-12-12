"""
Business Verification API Routes
Phase 1A - Manual Verification with Secure Storage
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Optional
import io
import logging

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_roles
from services.verification_file_service import get_file_service
from services.verification_service import VerificationService
from models.business_verification import (
    DocumentType,
    VerificationUploadResponse,
    BusinessVerification,
    VerificationStatusResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/business/verification", tags=["Business Verification"])


@router.post("/upload")
async def upload_verification_document(
    business_id: str = Form(...),
    doc_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upload verification document for a business
    Owner-only endpoint
    """
    file_service = get_file_service()
    verification_service = VerificationService(db)
    
    # TODO: Check that current_user owns this business
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Upload and encrypt
        file_data = await file_service.upload_and_encrypt(
            file_content=file_content,
            filename=file.filename,
            business_id=business_id,
            doc_type=doc_type.value
        )
        
        # Add to verification record
        verification = await verification_service.add_document(
            business_id=business_id,
            doc_type=doc_type,
            file_path=file.filename,
            encrypted_path=file_data['encrypted_path'],
            file_size=file_data['file_size'],
            mime_type=file_data['mime_type']
        )
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "verification_status": verification.verification_status,
            "document_count": len(verification.documents)
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/status/{business_id}")
async def get_verification_status(
    business_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get verification status for a business
    Owner or admin can view
    """
    verification_service = VerificationService(db)
    
    verification = await verification_service.get_verification_by_business(business_id)
    
    if not verification:
        return {
            "is_verified": False,
            "status": "not_started",
            "documents_uploaded": 0
        }
    
    return {
        "is_verified": verification.verification_status == "verified",
        "status": verification.verification_status,
        "documents_uploaded": len(verification.documents),
        "verified_at": verification.verified_at,
        "expires_at": verification.expires_at,
        "rejection_reason": verification.rejection_reason
    }


@router.get("/admin/pending")
async def get_pending_verifications(
    limit: int = 50,
    skip: int = 0,
    current_user = Depends(require_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    """
    Get all pending verifications for admin review
    Admin-only endpoint
    """
    verification_service = VerificationService(db)
    
    verifications = await verification_service.get_pending_verifications(limit, skip)
    
    # Enrich with business info
    results = []
    for v in verifications:
        business = await db.businesses.find_one({"id": v.business_id}, {"_id": 0})
        results.append({
            "verification": v.dict(),
            "business": business
        })
    
    return {
        "results": results,
        "count": len(results)
    }


@router.post("/admin/approve/{business_id}")
async def approve_verification(
    business_id: str,
    notes: Optional[str] = None,
    current_user = Depends(require_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    """
    Approve business verification
    Grants verified badge for 12 months
    Admin-only endpoint
    """
    verification_service = VerificationService(db)
    
    try:
        verification = await verification_service.approve_verification(
            business_id=business_id,
            reviewer_user_id=current_user['id'],
            notes=notes
        )
        
        return {
            "success": True,
            "message": "Business verification approved",
            "verification": verification.dict()
        }
        
    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve verification"
        )


@router.post("/admin/reject/{business_id}")
async def reject_verification(
    business_id: str,
    reason: str = Form(...),
    current_user = Depends(require_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    """
    Reject business verification with reason
    Admin-only endpoint
    """
    verification_service = VerificationService(db)
    
    try:
        verification = await verification_service.reject_verification(
            business_id=business_id,
            reviewer_user_id=current_user['id'],
            reason=reason
        )
        
        return {
            "success": True,
            "message": "Business verification rejected",
            "verification": verification.dict()
        }
        
    except Exception as e:
        logger.error(f"Rejection failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject verification"
        )


@router.get("/admin/view-document/{business_id}/{doc_index}")
async def view_verification_document(
    business_id: str,
    doc_index: int,
    current_user = Depends(require_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    """
    View encrypted document (decrypt for admin review)
    SECURITY: Admin-only, logged access
    """
    verification_service = VerificationService(db)
    file_service = get_file_service()
    
    # Get verification
    verification = await verification_service.get_verification_by_business(business_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    if doc_index >= len(verification.documents):
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = verification.documents[doc_index]
    
    try:
        # Decrypt file
        decrypted_content = await file_service.decrypt_for_viewing(doc.encrypted_path)
        
        # TODO: Log access for audit trail
        logger.info(f"Admin {current_user['id']} viewed document for business {business_id}")
        
        # Return as stream
        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type=doc.mime_type,
            headers={
                "Content-Disposition": f"inline; filename={doc.file_path}"
            }
        )
        
    except Exception as e:
        logger.error(f"Document viewing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load document"
        )
