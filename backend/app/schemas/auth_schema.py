"""
Authentication Schemas

Pydantic models for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from typing import ForwardRef


class SignupRequest(BaseModel):
    """User signup request"""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "SecurePass123"
            }
        }


class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    remember_me: bool = Field(default=False, description="Remember me option")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "SecurePass123",
                "remember_me": False
            }
        }


class GoogleAuthRequest(BaseModel):
    """Google OAuth authentication request"""
    token: str = Field(..., description="Google ID token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
            }
        }


class UserResponse(BaseModel):
    """User information response"""
    id: str = Field(..., description="User ID")
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    profile_picture: Optional[str] = Field(None, description="Profile picture URL")
    auth_provider: str = Field(..., description="Authentication provider (email/google)")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john@example.com",
                "profile_picture": "https://lh3.googleusercontent.com/a/...",
                "auth_provider": "google",
                "created_at": "2024-01-15T10:30:00"
            }
        }


class AuthResponse(BaseModel):
    """Authentication response with token and user data"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "507f1f77bcf86cd799439011",
                    "name": "John Doe",
                    "email": "john@example.com",
                    "profile_picture": None,
                    "auth_provider": "email",
                    "created_at": "2024-01-15T10:30:00"
                }
            }
        }


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str = Field(..., description="Response message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation successful"
            }
        }
