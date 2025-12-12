"""
Document Encryption Service
AES-256 encryption for sensitive business documents
"""

import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import logging

logger = logging.getLogger(__name__)


class DocumentEncryptionService:
    """
    Handles encryption/decryption of verification documents
    Uses AES-256 via Fernet (symmetric encryption)
    """
    
    def __init__(self):
        # Get encryption key from environment or generate
        self.encryption_key = self._get_or_create_key()
        self.cipher = Fernet(self.encryption_key)
    
    def _get_or_create_key(self) -> bytes:
        """
        Get encryption key from environment or create new one
        In production, this should be stored securely (e.g., AWS Secrets Manager)
        """
        key_env = os.getenv('DOCUMENT_ENCRYPTION_KEY')
        
        if key_env:
            return key_env.encode()
        
        # Generate key from password + salt
        password = os.getenv('SECRET_KEY', 'banibs-verification-key-change-in-prod').encode()
        salt = b'banibs_document_salt'  # Should be unique per deployment
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    def encrypt_file(self, file_content: bytes) -> bytes:
        """
        Encrypt file content
        
        Args:
            file_content: Raw file bytes
        
        Returns:
            Encrypted bytes
        """
        try:
            encrypted_data = self.cipher.encrypt(file_content)
            logger.info("✅ File encrypted successfully")
            return encrypted_data
        except Exception as e:
            logger.error(f"❌ Encryption failed: {str(e)}")
            raise
    
    def decrypt_file(self, encrypted_content: bytes) -> bytes:
        """
        Decrypt file content
        
        Args:
            encrypted_content: Encrypted bytes
        
        Returns:
            Decrypted bytes
        """
        try:
            decrypted_data = self.cipher.decrypt(encrypted_content)
            logger.info("✅ File decrypted successfully")
            return decrypted_data
        except Exception as e:
            logger.error(f"❌ Decryption failed: {str(e)}")
            raise
    
    def encrypt_and_save(self, file_content: bytes, output_path: str) -> str:
        """
        Encrypt file and save to disk
        
        Args:
            file_content: Raw file bytes
            output_path: Where to save encrypted file
        
        Returns:
            Path to encrypted file
        """
        encrypted_data = self.encrypt_file(file_content)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Write encrypted file
        with open(output_path, 'wb') as f:
            f.write(encrypted_data)
        
        logger.info(f"✅ Encrypted file saved: {output_path}")
        return output_path
    
    def load_and_decrypt(self, encrypted_path: str) -> bytes:
        """
        Load encrypted file and decrypt
        
        Args:
            encrypted_path: Path to encrypted file
        
        Returns:
            Decrypted file bytes
        """
        with open(encrypted_path, 'rb') as f:
            encrypted_data = f.read()
        
        return self.decrypt_file(encrypted_data)


# Singleton instance
_encryption_service = None

def get_encryption_service() -> DocumentEncryptionService:
    """Get or create encryption service singleton"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = DocumentEncryptionService()
    return _encryption_service
