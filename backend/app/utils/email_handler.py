"""
Email Handler

Handles sending emails using Gmail SMTP.
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from loguru import logger


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using Gmail SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_USER,
            password=settings.EMAIL_PASSWORD,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email
    
    Args:
        to_email: User's email address
        reset_token: Password reset token
        
    Returns:
        True if email sent successfully, False otherwise
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f5f5f5;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }}
            .header {{
                text-align: center;
                padding: 40px 20px 20px;
                background-color: #ffffff;
            }}
            .logo {{
                width: 80px;
                height: 80px;
                background: #ffffff;
                border-radius: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: #1f2937;
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }}
            .brand-name {{
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 10px 0 0 0;
            }}
            .content {{
                padding: 20px 40px 40px;
                background-color: #ffffff;
            }}
            .title {{
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 20px 0;
            }}
            .text {{
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
                margin: 0 0 20px 0;
            }}
            .button-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .button {{
                display: inline-block;
                padding: 14px 40px;
                background: #3b82f6;
                color: #ffffff;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 500;
                font-size: 15px;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
                transition: all 0.2s ease;
            }}
            .button:hover {{
                background: #2563eb;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
            }}
            .warning-box {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .warning-text {{
                font-size: 14px;
                color: #92400e;
                margin: 0;
            }}
            .footer {{
                padding: 20px 40px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 10px 0;
                line-height: 1.5;
            }}
            .link {{
                color: #3b82f6;
                word-break: break-all;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <path d="m16 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                        <path d="m2 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                    </svg>
                </div>
                <h2 class="brand-name">LexiAI</h2>
            </div>
            
            <div class="content">
                <h1 class="title">Reset Your Password</h1>
                
                <p class="text">Hello,</p>
                
                <p class="text">We received a request to reset your password for your LexiAI account. Click the button below to create a new password:</p>
                
                <div class="button-container">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <div class="warning-box">
                    <p class="warning-text"><strong>⚠️ Security Notice:</strong> This link will expire in 30 minutes for your security.</p>
                </div>
                
                <p class="text">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                
                <p class="text">For security reasons, please do not share this link with anyone.</p>
            </div>
            
            <div class="footer">
                <p class="footer-text">If the button doesn't work, copy and paste this link into your browser:</p>
                <p class="footer-text link">{reset_link}</p>
                <p class="footer-text" style="margin-top: 20px;">
                    Best regards,<br>
                    The LexiAI Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to_email=to_email,
        subject="Reset Your LexiAI Password",
        html_content=html_content
    )


async def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send OTP verification email
    
    Args:
        to_email: User's email address
        otp: 6-digit OTP code
        
    Returns:
        True if email sent successfully, False otherwise
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f5f5f5;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }}
            .header {{
                text-align: center;
                padding: 40px 20px 20px;
                background-color: #ffffff;
            }}
            .logo {{
                width: 80px;
                height: 80px;
                background: #ffffff;
                border-radius: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: #1f2937;
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }}
            .brand-name {{
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 10px 0 0 0;
            }}
            .content {{
                padding: 20px 40px 40px;
                background-color: #ffffff;
            }}
            .title {{
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 20px 0;
            }}
            .text {{
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
                margin: 0 0 20px 0;
            }}
            .otp-container {{
                text-align: center;
                margin: 30px 0;
                padding: 30px;
                background: #f9fafb;
                border-radius: 12px;
                border: 2px dashed #d1d5db;
            }}
            .otp-code {{
                font-size: 36px;
                font-weight: 700;
                color: #1f2937;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }}
            .otp-label {{
                font-size: 12px;
                color: #6b7280;
                margin-top: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .warning-box {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .warning-text {{
                font-size: 14px;
                color: #92400e;
                margin: 0;
            }}
            .footer {{
                padding: 20px 40px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 10px 0;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <path d="m16 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                        <path d="m2 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                    </svg>
                </div>
                <h2 class="brand-name">LexiAI</h2>
            </div>
            
            <div class="content">
                <h1 class="title">Verify Your Email</h1>
                
                <p class="text">Hello,</p>
                
                <p class="text">Thank you for signing up with LexiAI! To complete your registration, please use the verification code below:</p>
                
                <div class="otp-container">
                    <div class="otp-code">{otp}</div>
                    <div class="otp-label">Verification Code</div>
                </div>
                
                <div class="warning-box">
                    <p class="warning-text"><strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. Do not share this code with anyone.</p>
                </div>
                
                <p class="text">If you didn't create an account with LexiAI, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
                <p class="footer-text" style="margin-top: 20px;">
                    Best regards,<br>
                    The LexiAI Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to_email=to_email,
        subject="Verify Your LexiAI Account",
        html_content=html_content
    )
