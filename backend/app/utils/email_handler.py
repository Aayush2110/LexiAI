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
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                padding: 40px 20px;
            }}
            .email-wrapper {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }}
            .header {{
                text-align: center;
                padding: 48px 32px 32px;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                position: relative;
            }}
            .header::before {{
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 50%);
                pointer-events: none;
            }}
            .logo {{
                width: 56px;
                height: 56px;
                background: #ffffff;
                border-radius: 14px;
                display: inline-block;
                padding: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                margin-bottom: 16px;
            }}
            .logo svg {{
                display: block;
                width: 100%;
                height: 100%;
            }}
            .brand-name {{
                font-size: 28px;
                font-weight: 600;
                color: #ffffff;
                letter-spacing: -0.5px;
                display: block;
            }}
            .content {{
                padding: 48px 40px;
                background: #ffffff;
            }}
            .title {{
                font-size: 28px;
                font-weight: 600;
                color: #0a0a0a;
                margin: 0 0 24px 0;
                letter-spacing: -0.5px;
            }}
            .text {{
                font-size: 16px;
                line-height: 1.7;
                color: #525252;
                margin: 0 0 20px 0;
            }}
            .button-container {{
                text-align: center;
                margin: 36px 0;
            }}
            .button {{
                display: inline-block;
                padding: 16px 48px;
                background: #0a0a0a;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: -0.2px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }}
            .info-box {{
                background: #fafafa;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 20px;
                margin: 28px 0;
            }}
            .info-box-title {{
                font-size: 14px;
                font-weight: 600;
                color: #0a0a0a;
                margin: 0 0 8px 0;
            }}
            .info-box-text {{
                font-size: 14px;
                color: #737373;
                margin: 0;
                line-height: 1.6;
            }}
            .divider {{
                height: 1px;
                background: #e5e5e5;
                margin: 32px 0;
            }}
            .footer {{
                padding: 32px 40px;
                background: #fafafa;
                border-top: 1px solid #e5e5e5;
            }}
            .footer-text {{
                font-size: 14px;
                color: #737373;
                margin: 0 0 12px 0;
                line-height: 1.6;
            }}
            .link {{
                color: #0a0a0a;
                word-break: break-all;
                text-decoration: underline;
            }}
            .footer-signature {{
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e5e5e5;
            }}
            @media only screen and (max-width: 600px) {{
                .content {{
                    padding: 32px 24px;
                }}
                .footer {{
                    padding: 24px;
                }}
                .title {{
                    font-size: 24px;
                }}
                .button {{
                    padding: 14px 36px;
                    font-size: 15px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <path d="m16 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                        <path d="m2 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                    </svg>
                </div>
                <span class="brand-name">LexiAI</span>
            </div>
            
            <div class="content">
                <h1 class="title">Reset Your Password</h1>
                
                <p class="text">Hello,</p>
                
                <p class="text">We received a request to reset your password for your LexiAI account. Click the button below to create a new password and regain access to your legal workspace.</p>
                
                <div class="button-container">
                    <a href="{reset_link}" class="button" style="color: #ffffff !important;">Reset Password →</a>
                </div>
                
                <div class="info-box">
                    <div class="info-box-title">🔒 Security Notice</div>
                    <p class="info-box-text">This password reset link will expire in <strong>30 minutes</strong> for your security. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                
                <div class="divider"></div>
                
                <p class="text" style="font-size: 14px; color: #737373;">For security reasons, please do not share this link with anyone. If you continue to have issues accessing your account, please contact our support team.</p>
            </div>
            
            <div class="footer">
                <p class="footer-text">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p class="footer-text link">{reset_link}</p>
                
                <div class="footer-signature">
                    <p class="footer-text" style="margin: 0;">
                        Best regards,<br>
                        <strong>The LexiAI Team</strong>
                    </p>
                    <p class="footer-text" style="margin-top: 12px; font-size: 12px;">
                        © 2026 LexiAI · Built for legal professionals
                    </p>
                </div>
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
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                padding: 40px 20px;
            }}
            .email-wrapper {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }}
            .header {{
                text-align: center;
                padding: 48px 32px 32px;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                position: relative;
            }}
            .header::before {{
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 50%);
                pointer-events: none;
            }}
            .logo {{
                width: 56px;
                height: 56px;
                background: #ffffff;
                border-radius: 14px;
                display: inline-block;
                padding: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                margin-bottom: 16px;
            }}
            .logo svg {{
                display: block;
                width: 100%;
                height: 100%;
            }}
            .brand-name {{
                font-size: 28px;
                font-weight: 600;
                color: #ffffff;
                letter-spacing: -0.5px;
                display: block;
            }}
            .content {{
                padding: 48px 40px;
                background: #ffffff;
            }}
            .title {{
                font-size: 28px;
                font-weight: 600;
                color: #0a0a0a;
                margin: 0 0 24px 0;
                letter-spacing: -0.5px;
            }}
            .text {{
                font-size: 16px;
                line-height: 1.7;
                color: #525252;
                margin: 0 0 20px 0;
            }}
            .otp-container {{
                text-align: center;
                margin: 40px 0;
                padding: 40px 32px;
                background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                border-radius: 16px;
                border: 2px solid #e5e5e5;
                position: relative;
                overflow: hidden;
            }}
            .otp-container::before {{
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #0a0a0a 0%, #404040 100%);
            }}
            .otp-label {{
                font-size: 12px;
                color: #737373;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 600;
            }}
            .otp-code {{
                font-size: 48px;
                font-weight: 700;
                color: #0a0a0a;
                letter-spacing: 12px;
                font-family: 'Courier New', monospace;
                margin: 8px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .otp-expiry {{
                font-size: 13px;
                color: #737373;
                margin-top: 16px;
            }}
            .info-box {{
                background: #fafafa;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 20px;
                margin: 28px 0;
            }}
            .info-box-title {{
                font-size: 14px;
                font-weight: 600;
                color: #0a0a0a;
                margin: 0 0 8px 0;
            }}
            .info-box-text {{
                font-size: 14px;
                color: #737373;
                margin: 0;
                line-height: 1.6;
            }}
            .divider {{
                height: 1px;
                background: #e5e5e5;
                margin: 32px 0;
            }}
            .footer {{
                padding: 32px 40px;
                background: #fafafa;
                border-top: 1px solid #e5e5e5;
            }}
            .footer-text {{
                font-size: 14px;
                color: #737373;
                margin: 0 0 12px 0;
                line-height: 1.6;
            }}
            .footer-signature {{
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e5e5e5;
            }}
            .welcome-badge {{
                display: inline-block;
                padding: 8px 16px;
                background: #f5f5f5;
                border: 1px solid #e5e5e5;
                border-radius: 24px;
                font-size: 13px;
                color: #525252;
                margin-bottom: 24px;
            }}
            @media only screen and (max-width: 600px) {{
                .content {{
                    padding: 32px 24px;
                }}
                .footer {{
                    padding: 24px;
                }}
                .title {{
                    font-size: 24px;
                }}
                .otp-code {{
                    font-size: 36px;
                    letter-spacing: 8px;
                }}
                .otp-container {{
                    padding: 32px 24px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <path d="m16 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                        <path d="m2 16 3-11 3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3Z"></path>
                    </svg>
                </div>
                <span class="brand-name">LexiAI</span>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="welcome-badge">
                        ✨ Welcome to LexiAI
                    </div>
                </div>
                
                <h1 class="title">Verify Your Email</h1>
                
                <p class="text">Hello,</p>
                
                <p class="text">Thank you for signing up with LexiAI! We're excited to have you join our legal workspace. To complete your registration and start using your AI legal assistant, please verify your email address with the code below:</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">{otp}</div>
                    <div class="otp-expiry">⏱️ Expires in 10 minutes</div>
                </div>
                
                <div class="info-box">
                    <div class="info-box-title">🛡️ Security Notice</div>
                    <p class="info-box-text">This verification code is confidential and should not be shared with anyone. If you didn't create an account with LexiAI, you can safely ignore this email.</p>
                </div>
                
                <div class="divider"></div>
                
                <p class="text" style="font-size: 15px;">Once verified, you'll have access to:</p>
                <ul style="margin: 16px 0; padding-left: 24px; color: #525252; line-height: 1.8;">
                    <li style="margin-bottom: 8px;">AI-powered contract analysis</li>
                    <li style="margin-bottom: 8px;">Source-cited legal answers</li>
                    <li style="margin-bottom: 8px;">Document upload and management</li>
                    <li>Secure legal workspace</li>
                </ul>
            </div>
            
            <div class="footer">
                <div class="footer-signature">
                    <p class="footer-text" style="margin: 0;">
                        Best regards,<br>
                        <strong>The LexiAI Team</strong>
                    </p>
                    <p class="footer-text" style="margin-top: 12px; font-size: 12px;">
                        © 2026 LexiAI · Built for legal professionals
                    </p>
                </div>
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
