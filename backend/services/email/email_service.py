"""
Email Service for BANIBS
Handles sending emails via SMTP
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service for sending notifications
    
    Configuration via environment variables:
    - SMTP_HOST: SMTP server hostname
    - SMTP_PORT: SMTP server port (default: 587)
    - SMTP_USER: SMTP username
    - SMTP_PASSWORD: SMTP password
    - SMTP_FROM_EMAIL: From email address (default: noreply@banibs.com)
    """
    
    def __init__(self):
        self.mock_mode = os.getenv("SMTP_MOCK_MODE", "false").lower() == "true"
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_secure = os.getenv("SMTP_SECURE", "false").lower() == "true"
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "noreply@banibs.com")
        self.enabled = self.mock_mode or bool(self.smtp_host and self.smtp_user and self.smtp_password)
    
    def send_email(
        self,
        to: List[str],
        subject: str,
        body: str,
        bcc: Optional[List[str]] = None,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Send an email
        
        Args:
            to: List of recipient email addresses
            subject: Email subject
            body: Plain text email body
            bcc: Optional list of BCC recipients
            html_body: Optional HTML version of email body
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning("Email service not configured. Skipping email send.")
            logger.info(f"Would have sent email to {to}: {subject}")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = ', '.join(to)
            msg['Subject'] = subject
            
            # Attach plain text body
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach HTML body if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Connect to SMTP server (use SSL for port 465, STARTTLS for port 587)
            if self.smtp_secure:
                # Port 465 with implicit SSL/TLS
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    
                    # Send to primary recipients and BCC
                    all_recipients = to + (bcc if bcc else [])
                    server.sendmail(self.from_email, all_recipients, msg.as_string())
            else:
                # Port 587 with STARTTLS
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    
                    # Send to primary recipients and BCC
                    all_recipients = to + (bcc if bcc else [])
                    server.sendmail(self.from_email, all_recipients, msg.as_string())
            
            logger.info(f"Email sent successfully to {to}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    def send_waitlist_notification(self, email: str, submitted_at: str, source: str) -> bool:
        """
        Send waitlist signup notification to BANIBS team
        
        Args:
            email: User's email address
            submitted_at: Timestamp of submission
            source: Source of signup (e.g. "coming_soon_v2")
            
        Returns:
            True if email sent successfully, False otherwise
        """
        subject = "New BANIBS waitlist signup"
        
        body = f"""New waitlist signup received:

Email: {email}
Submitted at: {submitted_at}
Source: {source}

---
BANIBS Waitlist System
"""
        
        to = ["waitlist@banibs.com"]
        bcc = ["RaymondNeely@banibs.com"]
        
        return self.send_email(to=to, subject=subject, body=body, bcc=bcc)


# Global email service instance
email_service = EmailService()
