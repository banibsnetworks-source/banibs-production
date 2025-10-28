import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional, Literal
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# SMTP Configuration from environment variables
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "BANIBS <noreply@banibs.com>")

# Check if SMTP is configured
SMTP_CONFIGURED = all([SMTP_HOST, SMTP_USER, SMTP_PASS])

def send_email(to_email: str, subject: str, html_body: str):
    """
    Phase 3.3 - Send email via SMTP
    Falls back to logging if SMTP not configured
    """
    if not SMTP_CONFIGURED:
        logger.warning(f"SMTP not configured. Would send email to {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body: {html_body}")
        return
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach HTML body
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send via SMTP
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")

def send_opportunity_approved_email(contributor_email: str, opportunity_title: str, opportunity_id: str):
    """
    Phase 3.3 - Send approved notification email
    """
    subject = "🎉 Your Opportunity Has Been Approved - BANIBS"
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 10px; padding: 30px;">
                <h1 style="color: #FFD700; text-align: center;">BANIBS</h1>
                <h2 style="color: #ffffff;">Great News!</h2>
                <p style="color: #dddddd; font-size: 16px;">
                    Your opportunity submission "<strong>{opportunity_title}</strong>" has been approved and is now live on the BANIBS platform.
                </p>
                <p style="color: #dddddd; font-size: 16px;">
                    Your contribution helps connect people with valuable opportunities. Thank you for being part of the BANIBS community!
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://banibs.com/opportunities" style="background-color: #FFD700; color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        View Your Opportunity
                    </a>
                </div>
                <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2025 BANIBS. All opportunities are human-reviewed and curated.
                </p>
            </div>
        </body>
    </html>
    """
    
    send_email(contributor_email, subject, html_body)

def send_opportunity_rejected_email(contributor_email: str, opportunity_title: str, rejection_reason: Optional[str] = None):
    """
    Phase 3.3 - Send rejected notification email
    Must include moderator note as rejection reason
    """
    subject = "Opportunity Submission Update - BANIBS"
    
    reason_text = rejection_reason if rejection_reason else "Your submission did not meet our platform guidelines at this time."
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 10px; padding: 30px;">
                <h1 style="color: #FFD700; text-align: center;">BANIBS</h1>
                <h2 style="color: #ffffff;">Submission Update</h2>
                <p style="color: #dddddd; font-size: 16px;">
                    Thank you for submitting "<strong>{opportunity_title}</strong>" to BANIBS.
                </p>
                <p style="color: #dddddd; font-size: 16px;">
                    Unfortunately, we're unable to approve this submission at this time.
                </p>
                <div style="background-color: #2a2a2a; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
                    <p style="color: #ffffff; margin: 0;"><strong>Reason:</strong></p>
                    <p style="color: #cccccc; margin: 10px 0 0 0;">{reason_text}</p>
                </div>
                <p style="color: #dddddd; font-size: 16px;">
                    We encourage you to review our guidelines and submit again. We appreciate your contribution to the community.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://banibs.com/submit" style="background-color: #FFD700; color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Submit Another Opportunity
                    </a>
                </div>
                <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2025 BANIBS. All opportunities are human-reviewed and curated.
                </p>
            </div>
        </body>
    </html>
    """
    
    send_email(contributor_email, subject, html_body)

def send_opportunity_featured_email(contributor_email: str, opportunity_title: str):
    """
    Phase 3.3 - Send featured notification email
    """
    subject = "⭐ Your Opportunity is Now Featured - BANIBS"
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 10px; padding: 30px;">
                <h1 style="color: #FFD700; text-align: center;">BANIBS</h1>
                <h2 style="color: #FFD700;">⭐ Featured Opportunity!</h2>
                <p style="color: #dddddd; font-size: 16px;">
                    Exciting news! Your opportunity "<strong>{opportunity_title}</strong>" has been selected as a featured opportunity on BANIBS.
                </p>
                <p style="color: #dddddd; font-size: 16px;">
                    Featured opportunities receive prime placement on our platform and are highlighted to our community. This means increased visibility and engagement for your submission.
                </p>
                <p style="color: #dddddd; font-size: 16px;">
                    Thank you for submitting high-quality opportunities that make a difference!
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://banibs.com/opportunities" style="background-color: #FFD700; color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        View Featured Opportunities
                    </a>
                </div>
                <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2025 BANIBS. All opportunities are human-reviewed and curated.
                </p>
            </div>
        </body>
    </html>
    """
    
    send_email(contributor_email, subject, html_body)

async def generate_weekly_digest(db):
    """
    Phase 3.3 - Generate weekly digest of new/featured opportunities
    Returns structured data for email composition
    DO NOT SEND AUTOMATICALLY - Just return the digest data
    """
    from datetime import timezone
    
    # Calculate date range (last 7 days)
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    
    # Fetch new approved opportunities from the last week
    new_opportunities = await db.opportunities.find({
        "approved": True,
        "createdAt": {"$gte": week_ago}
    }).to_list(length=None)
    
    # Fetch featured opportunities
    featured_opportunities = await db.opportunities.find({
        "featured": True,
        "approved": True
    }).to_list(length=None)
    
    # Group by type
    opportunities_by_type = {
        "job": [],
        "grant": [],
        "scholarship": [],
        "training": [],
        "event": []
    }
    
    for opp in new_opportunities:
        opp_type = opp.get("type", "job")
        opportunities_by_type[opp_type].append({
            "id": str(opp["_id"]),
            "title": opp["title"],
            "orgName": opp["orgName"],
            "description": opp["description"][:150] + "..." if len(opp["description"]) > 150 else opp["description"],
            "deadline": opp.get("deadline"),
            "link": opp.get("link")
        })
    
    featured_list = [
        {
            "id": str(opp["_id"]),
            "title": opp["title"],
            "orgName": opp["orgName"],
            "type": opp["type"],
            "description": opp["description"][:150] + "..." if len(opp["description"]) > 150 else opp["description"]
        }
        for opp in featured_opportunities
    ]
    
    digest = {
        "week_start": week_ago.isoformat(),
        "week_end": now.isoformat(),
        "total_new_opportunities": len(new_opportunities),
        "opportunities_by_type": opportunities_by_type,
        "featured_opportunities": featured_list,
        "summary_counts": {
            "jobs": len(opportunities_by_type["job"]),
            "grants": len(opportunities_by_type["grant"]),
            "scholarships": len(opportunities_by_type["scholarship"]),
            "training": len(opportunities_by_type["training"]),
            "events": len(opportunities_by_type["event"])
        }
    }
    
    logger.info(f"Weekly digest generated: {digest['total_new_opportunities']} new opportunities")
    return digest


def send_digest_email(to_email: str, digest_data: dict):
    """
    Phase 5.2 - Send weekly digest email to subscriber
    
    Args:
        to_email: Subscriber email address
        digest_data: Digest data from generate_weekly_digest()
    """
    subject = "📬 Your Weekly BANIBS Digest - New Opportunities Await!"
    
    # Build opportunity sections by type
    def build_opportunity_section(opportunities, type_name):
        if not opportunities:
            return ""
        
        items_html = ""
        for opp in opportunities[:5]:  # Limit to 5 per type
            items_html += f"""
                <div style="margin-bottom: 20px; padding: 15px; background-color: #2a2a2a; border-radius: 8px;">
                    <h4 style="color: #FFD700; margin: 0 0 10px 0;">{opp['title']}</h4>
                    <p style="color: #999999; margin: 0 0 5px 0; font-size: 14px;">{opp['orgName']}</p>
                    <p style="color: #dddddd; font-size: 14px; margin: 0 0 10px 0;">{opp['description']}</p>
                    {f'<p style="color: #FFD700; font-size: 13px; margin: 0;">⏰ Deadline: {opp["deadline"]}</p>' if opp.get('deadline') else ''}
                </div>
            """
        
        return f"""
            <div style="margin-bottom: 30px;">
                <h3 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
                    {type_name} ({len(opportunities)})
                </h3>
                {items_html}
            </div>
        """
    
    # Build all sections
    jobs_section = build_opportunity_section(digest_data['opportunities_by_type']['job'], "💼 Jobs")
    grants_section = build_opportunity_section(digest_data['opportunities_by_type']['grant'], "💰 Grants")
    scholarships_section = build_opportunity_section(digest_data['opportunities_by_type']['scholarship'], "🎓 Scholarships")
    training_section = build_opportunity_section(digest_data['opportunities_by_type']['training'], "📚 Training")
    events_section = build_opportunity_section(digest_data['opportunities_by_type']['event'], "📅 Events")
    
    # Build featured section
    featured_html = ""
    if digest_data['featured_opportunities']:
        featured_items = ""
        for opp in digest_data['featured_opportunities'][:3]:
            featured_items += f"""
                <div style="margin-bottom: 15px; padding: 15px; background-color: #2a2a2a; border-left: 4px solid #FFD700; border-radius: 4px;">
                    <h4 style="color: #FFD700; margin: 0 0 5px 0;">{opp['title']}</h4>
                    <p style="color: #999999; margin: 0 0 5px 0; font-size: 13px;">{opp['orgName']} • {opp['type'].upper()}</p>
                    <p style="color: #dddddd; font-size: 14px; margin: 0;">{opp['description']}</p>
                </div>
            """
        
        featured_html = f"""
            <div style="margin-bottom: 30px;">
                <h3 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
                    ⭐ Featured Opportunities
                </h3>
                {featured_items}
            </div>
        """
    
    # Summary counts
    summary_html = f"""
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #FFD700; margin-top: 0;">This Week's Summary</h3>
            <p style="color: #ffffff; font-size: 18px; margin: 10px 0;">
                <strong>{digest_data['total_new_opportunities']}</strong> new opportunities added
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                <span style="color: #dddddd;">💼 Jobs: {digest_data['summary_counts']['jobs']}</span>
                <span style="color: #dddddd;">💰 Grants: {digest_data['summary_counts']['grants']}</span>
                <span style="color: #dddddd;">🎓 Scholarships: {digest_data['summary_counts']['scholarships']}</span>
                <span style="color: #dddddd;">📚 Training: {digest_data['summary_counts']['training']}</span>
                <span style="color: #dddddd;">📅 Events: {digest_data['summary_counts']['events']}</span>
            </div>
        </div>
    """
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
            <div style="max-width: 700px; margin: 0 auto; background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 10px; padding: 30px;">
                <h1 style="color: #FFD700; text-align: center; margin-bottom: 10px;">BANIBS</h1>
                <p style="text-align: center; color: #999999; margin-bottom: 30px;">Your Weekly Opportunities Digest</p>
                
                {summary_html}
                
                {featured_html}
                
                {jobs_section}
                {grants_section}
                {scholarships_section}
                {training_section}
                {events_section}
                
                <div style="text-align: center; margin: 40px 0 20px 0;">
                    <a href="https://banibs.com/opportunities" style="background-color: #FFD700; color: #000000; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                        View All Opportunities
                    </a>
                </div>
                
                <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #333333; padding-top: 20px;">
                    You're receiving this because you subscribed to BANIBS newsletter.<br/>
                    © 2025 BANIBS. All opportunities are human-reviewed and curated.
                </p>
            </div>
        </body>
    </html>
    """
    
    send_email(to_email, subject, html_body)
