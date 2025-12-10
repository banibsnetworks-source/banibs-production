"""
Business Verification Management Service
Core business logic for verification workflow
"""

from datetime import datetime, timedelta
from typing import Optional, List
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.business_verification import (
    BusinessVerification,
    VerificationDocument,
    VerificationStatus,
    VerificationBadge,
    DocumentType
)

logger = logging.getLogger(__name__)


class VerificationService:
    """
    Manages business verification workflow
    - Create verification records
    - Add documents
    - Approve/reject
    - Badge management
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.business_verifications
    
    async def get_or_create_verification(
        self,
        business_id: str,
        owner_user_id: str
    ) -> BusinessVerification:
        """
        Get existing verification record or create new one
        Only one active verification per business
        """
        existing = await self.collection.find_one({"business_id": business_id})
        
        if existing:
            return BusinessVerification(**existing)
        
        # Create new verification record
        verification = BusinessVerification(
            business_id=business_id,
            owner_user_id=owner_user_id,
            verification_status=VerificationStatus.PENDING
        )
        
        result = await self.collection.insert_one(verification.dict())
        verification_dict = await self.collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"✅ Created verification record for business: {business_id}")
        return BusinessVerification(**verification_dict)
    
    async def add_document(
        self,
        business_id: str,
        doc_type: DocumentType,
        file_path: str,
        encrypted_path: str,
        file_size: int,
        mime_type: str
    ) -> BusinessVerification:
        """
        Add a verification document to the business record
        """
        verification = await self.get_or_create_verification(business_id, "")
        
        # Create document record
        doc = VerificationDocument(
            type=doc_type,
            file_path=file_path,
            encrypted_path=encrypted_path,
            file_size=file_size,
            mime_type=mime_type,
            uploaded_at=datetime.utcnow()
        )
        
        # Add to documents array
        await self.collection.update_one(
            {"business_id": business_id},
            {
                "$push": {"documents": doc.dict()},
                "$set": {
                    "updated_at": datetime.utcnow(),
                    "verification_status": VerificationStatus.PENDING
                }
            }
        )
        
        logger.info(f"✅ Document added: {doc_type} for business {business_id}")
        
        # Return updated verification
        updated = await self.collection.find_one({"business_id": business_id})
        return BusinessVerification(**updated)
    
    async def approve_verification(
        self,
        business_id: str,
        reviewer_user_id: str,
        notes: Optional[str] = None
    ) -> BusinessVerification:
        """
        Approve verification - grant verified badge
        Badge expires in 12 months
        """
        now = datetime.utcnow()
        expires_at = now + timedelta(days=365)
        
        # Create badge
        badge = VerificationBadge(
            status="verified",
            verified_at=now,
            expires_at=expires_at
        )
        
        # Update verification record
        await self.collection.update_one(
            {"business_id": business_id},
            {
                "$set": {
                    "verification_status": VerificationStatus.VERIFIED,
                    "verified_at": now,
                    "expires_at": expires_at,
                    "reviewed_by": reviewer_user_id,
                    "reviewed_at": now,
                    "needs_human_review": False,
                    "badge": badge.dict(),
                    "updated_at": now
                }
            }
        )
        
        # Update business profile with badge
        await self.db.businesses.update_one(
            {"id": business_id},
            {
                "$set": {
                    "verification_badge": badge.dict(),
                    "is_verified": True,
                    "verified_at": now
                }
            }
        )
        
        logger.info(f"✅ Verification APPROVED for business: {business_id}")
        
        updated = await self.collection.find_one({"business_id": business_id})
        return BusinessVerification(**updated)
    
    async def reject_verification(
        self,
        business_id: str,
        reviewer_user_id: str,
        reason: str
    ) -> BusinessVerification:
        """
        Reject verification with reason
        """
        now = datetime.utcnow()
        
        await self.collection.update_one(
            {"business_id": business_id},
            {
                "$set": {
                    "verification_status": VerificationStatus.REJECTED,
                    "rejected_at": now,
                    "rejection_reason": reason,
                    "reviewed_by": reviewer_user_id,
                    "reviewed_at": now,
                    "needs_human_review": False,
                    "updated_at": now
                }
            }
        )
        
        # Remove badge from business if exists
        await self.db.businesses.update_one(
            {"id": business_id},
            {
                "$set": {
                    "is_verified": False
                },
                "$unset": {
                    "verification_badge": "",
                    "verified_at": ""
                }
            }
        )
        
        logger.info(f"❌ Verification REJECTED for business: {business_id}")
        
        updated = await self.collection.find_one({"business_id": business_id})
        return BusinessVerification(**updated)
    
    async def get_verification_by_business(
        self,
        business_id: str
    ) -> Optional[BusinessVerification]:
        """Get verification record for a business"""
        record = await self.collection.find_one({"business_id": business_id})
        if record:
            return BusinessVerification(**record)
        return None
    
    async def get_pending_verifications(
        self,
        limit: int = 50,
        skip: int = 0
    ) -> List[BusinessVerification]:
        """
        Get all pending verifications for admin review
        """
        cursor = self.collection.find(
            {"verification_status": {"$in": [VerificationStatus.PENDING, VerificationStatus.NEEDS_REVIEW]}}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        records = await cursor.to_list(length=limit)
        return [BusinessVerification(**r) for r in records]
    
    async def check_expiring_soon(self, days_threshold: int = 30) -> List[BusinessVerification]:
        """
        Find verifications expiring within threshold
        Used for renewal reminders
        """
        threshold_date = datetime.utcnow() + timedelta(days=days_threshold)
        
        cursor = self.collection.find({
            "verification_status": VerificationStatus.VERIFIED,
            "expires_at": {"$lte": threshold_date}
        })
        
        records = await cursor.to_list(length=100)
        return [BusinessVerification(**r) for r in records]
