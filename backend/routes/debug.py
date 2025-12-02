"""
Debug Routes - Email Testing and Diagnostics
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_service import send_email, SMTP_CONFIGURED, SMTP_HOST, SMTP_PORT, SMTP_USER, EMAIL_FROM
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/debug", tags=["debug"])

class TestEmailRequest(BaseModel):
    email: EmailStr

@router.post("/test-email")
async def test_email(request: TestEmailRequest):
    """
    Test email endpoint - Verify email sending works
    Sends a simple test email to confirm SMTP configuration
    """
    logger.info(f"🧪 TEST EMAIL requested for: {request.email}")
    
    # Check SMTP configuration
    logger.info(f"📧 SMTP Configuration Check:")
    logger.info(f"   - SMTP_CONFIGURED: {SMTP_CONFIGURED}")
    logger.info(f"   - SMTP_HOST: {SMTP_HOST or 'NOT SET'}")
    logger.info(f"   - SMTP_PORT: {SMTP_PORT}")
    logger.info(f"   - SMTP_USER: {SMTP_USER or 'NOT SET'}")
    logger.info(f"   - EMAIL_FROM: {EMAIL_FROM}")
    
    if not SMTP_CONFIGURED:
        logger.warning("⚠️ SMTP not configured - email will be logged but not sent")
        return {
            "success": False,
            "error": "SMTP not configured. Email would be logged but not sent.",
            "details": {
                "smtp_host": SMTP_HOST,
                "smtp_port": SMTP_PORT,
                "smtp_user": SMTP_USER,
                "configured": SMTP_CONFIGURED
            }
        }
    
    try:
        subject = "🧪 BANIBS Test Email"
        html_body = """
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #f59e0b; margin-bottom: 20px;">✅ BANIBS Email Test</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        If you are reading this, email sending from the BANIBS server is <strong>working correctly</strong>.
                    </p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>Test Details:</strong><br>
                            This is a test email sent from the BANIBS debug endpoint.
                        </p>
                    </div>
                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                        Sent from BANIBS Email Service
                    </p>
                </div>
            </body>
        </html>
        """
        
        logger.info(f"📤 Attempting to send test email to: {request.email}")
        
        # Call the same email service used by forgot password
        send_email(request.email, subject, html_body)
        
        logger.info(f"✅ Test email sent successfully to: {request.email}")
        
        return {
            "success": True,
            "message": f"Test email sent to {request.email}",
            "details": {
                "smtp_host": SMTP_HOST,
                "smtp_port": SMTP_PORT,
                "from_address": EMAIL_FROM
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to send test email: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to send test email. Check server logs for details."
        }

@router.get("/email-config")
async def email_config():
    """
    Check email configuration status
    """
    return {
        "smtp_configured": SMTP_CONFIGURED,
        "smtp_host": SMTP_HOST or "NOT SET",
        "smtp_port": SMTP_PORT,
        "smtp_user": SMTP_USER or "NOT SET",
        "email_from": EMAIL_FROM,
        "status": "configured" if SMTP_CONFIGURED else "not_configured"
    }
