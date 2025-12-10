"""
Verification File Upload Service
Handles file validation, encryption, and storage
"""

import os
import uuid
import magic
import hashlib
from datetime import datetime
from typing import Tuple
import logging

from services.document_encryption import get_encryption_service

logger = logging.getLogger(__name__)

# Allowed file types
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif'
]

ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.heic', '.heif']

# File size limits (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Storage paths
ENCRYPTED_STORAGE_BASE = "/app/backend/storage/encrypted"
TEMP_STORAGE_BASE = "/app/backend/storage/temp"


class VerificationFileService:
    """
    Handles verification document uploads with encryption
    """
    
    def __init__(self):
        self.encryption_service = get_encryption_service()
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create storage directories if they don't exist"""
        os.makedirs(ENCRYPTED_STORAGE_BASE, exist_ok=True)
        os.makedirs(TEMP_STORAGE_BASE, exist_ok=True)
        logger.info("✅ Storage directories verified")
    
    def validate_file(self, file_content: bytes, filename: str) -> Tuple[bool, str]:
        """
        Validate file type and size
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
        
        Returns:
            (is_valid, error_message)
        """
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            return False, f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        
        # Check extension
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        
        # Check MIME type
        try:
            mime = magic.from_buffer(file_content, mime=True)
            if mime not in ALLOWED_MIME_TYPES:
                return False, f"Invalid file type detected: {mime}"
        except Exception as e:
            logger.warning(f"MIME type detection failed: {e}")
            # Continue anyway if magic fails
        
        return True, ""
    
    def generate_secure_filename(self, business_id: str, doc_type: str, original_filename: str) -> str:
        """
        Generate secure filename for encrypted storage
        
        Format: {business_id}_{doc_type}_{timestamp}_{random}.enc
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        random_suffix = uuid.uuid4().hex[:8]
        ext = os.path.splitext(original_filename)[1].lower()
        
        # Sanitize doc_type for filename
        doc_type_clean = doc_type.replace(' ', '_').lower()
        
        return f"{business_id}_{doc_type_clean}_{timestamp}_{random_suffix}{ext}.enc"
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """Calculate SHA-256 hash of file for integrity checking"""
        return hashlib.sha256(file_content).hexdigest()
    
    async def upload_and_encrypt(
        self,
        file_content: bytes,
        filename: str,
        business_id: str,
        doc_type: str
    ) -> dict:
        """
        Upload file, validate, encrypt, and store
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            business_id: Business ID
            doc_type: Document type
        
        Returns:
            {
                'encrypted_path': str,
                'file_hash': str,
                'file_size': int,
                'mime_type': str,
                'original_filename': str
            }
        """
        # Validate file
        is_valid, error_msg = self.validate_file(file_content, filename)
        if not is_valid:
            raise ValueError(error_msg)
        
        # Generate secure filename
        secure_filename = self.generate_secure_filename(business_id, doc_type, filename)
        encrypted_path = os.path.join(ENCRYPTED_STORAGE_BASE, secure_filename)
        
        # Calculate file hash
        file_hash = self.calculate_file_hash(file_content)
        
        # Detect MIME type
        try:
            mime_type = magic.from_buffer(file_content, mime=True)
        except:
            mime_type = 'application/octet-stream'
        
        # Encrypt and save
        try:
            self.encryption_service.encrypt_and_save(file_content, encrypted_path)
            logger.info(f"✅ File encrypted and saved: {secure_filename}")
        except Exception as e:
            logger.error(f"❌ Failed to encrypt file: {e}")
            raise
        
        return {
            'encrypted_path': encrypted_path,
            'file_hash': file_hash,
            'file_size': len(file_content),
            'mime_type': mime_type,
            'original_filename': filename
        }
    
    async def decrypt_for_viewing(self, encrypted_path: str) -> bytes:
        """
        Decrypt file for admin viewing
        SECURITY: This should only be called by authorized admin endpoints
        
        Args:
            encrypted_path: Path to encrypted file
        
        Returns:
            Decrypted file bytes
        """
        if not os.path.exists(encrypted_path):
            raise FileNotFoundError(f"Encrypted file not found: {encrypted_path}")
        
        try:
            decrypted_content = self.encryption_service.load_and_decrypt(encrypted_path)
            logger.info(f"✅ File decrypted for viewing: {os.path.basename(encrypted_path)}")
            return decrypted_content
        except Exception as e:
            logger.error(f"❌ Failed to decrypt file: {e}")
            raise
    
    async def delete_file(self, encrypted_path: str) -> bool:
        """
        Delete encrypted file
        
        Args:
            encrypted_path: Path to encrypted file
        
        Returns:
            True if deleted successfully
        """
        try:
            if os.path.exists(encrypted_path):
                os.remove(encrypted_path)
                logger.info(f"✅ File deleted: {encrypted_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Failed to delete file: {e}")
            return False


# Singleton instance
_file_service = None

def get_file_service() -> VerificationFileService:
    """Get or create file service singleton"""
    global _file_service
    if _file_service is None:
        _file_service = VerificationFileService()
    return _file_service
