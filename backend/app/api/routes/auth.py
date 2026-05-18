"""
Authentication Routes

Handles user authentication including:
- Email/password signup and login
- Google OAuth authentication
- JWT token management
- User profile retrieval
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from loguru import logger
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.schemas.auth_schema import (
    SignupRequest,
    LoginRequest,
    GoogleAuthRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    UpdateProfileRequest
)
from app.services.database import get_users_collection
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.email_handler import send_password_reset_email, send_otp_email
from app.middleware.auth_middleware import get_current_user
from app.core.config import settings
import random
import string

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP storage (in production, use Redis or database)
otp_storage = {}  # {email: {"otp": "123456", "data": {...}, "expires": timestamp}}


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def signup(request: SignupRequest):
    """
    Initiate signup process - sends OTP to email
    
    - Validates email uniqueness
    - Generates and sends OTP
    - Stores signup data temporarily
    """
    try:
        users_collection = get_users_collection()
        
        # Check if email already exists
        existing_user = await users_collection.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP and signup data temporarily (expires in 10 minutes)
        from datetime import datetime, timedelta
        otp_storage[request.email] = {
            "otp": otp,
            "data": {
                "name": request.name,
                "email": request.email,
                "password": request.password  # Will be hashed when verified
            },
            "expires": datetime.utcnow() + timedelta(minutes=10)
        }
        
        # Send OTP email
        email_sent = await send_otp_email(to_email=request.email, otp=otp)
        
        if not email_sent:
            logger.error(f"Failed to send OTP email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email. Please try again."
            )
        
        logger.info(f"OTP sent to {request.email}")
        
        return MessageResponse(
            message="Verification code sent to your email. Please check your inbox."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/verify-otp", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP and complete user registration
    
    - Validates OTP
    - Creates user account
    - Returns JWT token
    """
    try:
        # Check if OTP exists for this email
        if request.email not in otp_storage:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code found. Please request a new one."
            )
        
        stored_data = otp_storage[request.email]
        
        # Check if OTP expired
        from datetime import datetime
        if datetime.utcnow() > stored_data["expires"]:
            del otp_storage[request.email]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code expired. Please request a new one."
            )
        
        # Verify OTP
        if stored_data["otp"] != request.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code. Please try again."
            )
        
        # OTP is valid, create user
        users_collection = get_users_collection()
        signup_data = stored_data["data"]
        
        # Hash password
        hashed_password = hash_password(signup_data["password"])
        
        # Create user document
        user_doc = {
            "name": signup_data["name"],
            "email": signup_data["email"],
            "password": hashed_password,
            "auth_provider": "email",
            "google_id": None,
            "profile_picture": None,
            "created_at": datetime.utcnow()
        }
        
        # Insert user
        result = await users_collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Remove OTP from storage
        del otp_storage[request.email]
        
        # Create JWT token
        access_token = create_access_token(data={"sub": signup_data["email"]})
        
        # Prepare response
        user_response = UserResponse(
            id=str(user_doc["_id"]),
            name=user_doc["name"],
            email=user_doc["email"],
            profile_picture=user_doc["profile_picture"],
            auth_provider=user_doc["auth_provider"],
            created_at=user_doc["created_at"],
            organization=user_doc.get("organization")
        )
        
        logger.info(f"New user registered and verified: {signup_data['email']}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Verification failed. Please try again."
        )


@router.post("/resend-otp", response_model=MessageResponse)
async def resend_otp(request: ResendOTPRequest):
    """
    Resend OTP to email
    
    - Generates new OTP
    - Sends email
    """
    try:
        # Check if there's pending signup data
        if request.email not in otp_storage:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending verification found. Please start signup again."
            )
        
        # Generate new OTP
        otp = generate_otp()
        
        # Update OTP and expiry
        from datetime import datetime, timedelta
        otp_storage[request.email]["otp"] = otp
        otp_storage[request.email]["expires"] = datetime.utcnow() + timedelta(minutes=10)
        
        # Send OTP email
        email_sent = await send_otp_email(to_email=request.email, otp=otp)
        
        if not email_sent:
            logger.error(f"Failed to resend OTP email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email. Please try again."
            )
        
        logger.info(f"OTP resent to {request.email}")
        
        return MessageResponse(
            message="New verification code sent to your email."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification code. Please try again."
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login user with email and password
    
    - Validates credentials
    - Returns JWT token
    - Supports "remember me" option
    """
    try:
        users_collection = get_users_collection()
        
        # Find user by email
        user = await users_collection.find_one({"email": request.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user registered with Google
        if user.get("auth_provider") == "google":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account uses Google Sign-In. Please login with Google."
            )
        
        # Verify password
        if not user.get("password") or not verify_password(request.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create JWT token (extend expiry if remember_me is True)
        token_data = {"sub": user["email"]}
        if request.remember_me:
            from datetime import timedelta
            access_token = create_access_token(
                data=token_data,
                expires_delta=timedelta(days=30)  # 30 days for remember me
            )
        else:
            access_token = create_access_token(data=token_data)
        
        # Prepare response
        user_response = UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            profile_picture=user.get("profile_picture"),
            auth_provider=user.get("auth_provider", "email"),
            created_at=user["created_at"],
            organization=user.get("organization")
        )
        
        logger.info(f"User logged in: {request.email}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate user with Google OAuth
    
    - Verifies Google ID token
    - Creates user if first time login
    - Returns JWT token
    """
    try:
        # Verify Google token
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Google authentication is not configured"
            )
        
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                request.token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Extract user info from Google token
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture')
            
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        users_collection = get_users_collection()
        
        # Check if user exists
        user = await users_collection.find_one({
            "$or": [
                {"email": email},
                {"google_id": google_id}
            ]
        })
        
        if user:
            # Update existing user with Google info if needed
            update_data = {}
            if not user.get("google_id"):
                update_data["google_id"] = google_id
            if not user.get("profile_picture") and picture:
                update_data["profile_picture"] = picture
            if user.get("auth_provider") != "google":
                update_data["auth_provider"] = "google"
            
            if update_data:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": update_data}
                )
                user.update(update_data)
        
        else:
            # Create new user
            user_doc = {
                "name": name,
                "email": email,
                "password": None,  # No password for Google users
                "auth_provider": "google",
                "google_id": google_id,
                "profile_picture": picture,
                "created_at": datetime.utcnow()
            }
            
            result = await users_collection.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            user = user_doc
            
            logger.info(f"New Google user registered: {email}")
        
        # Create JWT token
        access_token = create_access_token(data={"sub": email})
        
        # Prepare response
        user_response = UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            profile_picture=user.get("profile_picture"),
            auth_provider=user.get("auth_provider", "google"),
            created_at=user["created_at"],
            organization=user.get("organization")
        )
        
        logger.info(f"Google user authenticated: {email}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed. Please try again."
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    
    Protected route - requires valid JWT token
    """
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        profile_picture=current_user.get("profile_picture"),
        auth_provider=current_user.get("auth_provider", "email"),
        created_at=current_user["created_at"],
        organization=current_user.get("organization")
    )


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user profile
    
    Protected route - requires valid JWT token
    """
    users_collection = get_users_collection()
    
    # Build update data - only include fields that are provided
    update_data = {}
    if request.name is not None and request.name.strip():
        update_data["name"] = request.name.strip()
    if request.organization is not None:
        update_data["organization"] = request.organization.strip() if request.organization else ""
    
    if not update_data:
        # Return current user if no changes
        return UserResponse(
            id=str(current_user["_id"]),
            name=current_user["name"],
            email=current_user["email"],
            profile_picture=current_user.get("profile_picture"),
            auth_provider=current_user.get("auth_provider", "email"),
            created_at=current_user["created_at"],
            organization=current_user.get("organization")
        )
    
    # Update user in database
    from bson import ObjectId
    result = users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user = users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"User profile updated: {updated_user['email']}")
    
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user["name"],
        email=updated_user["email"],
        profile_picture=updated_user.get("profile_picture"),
        auth_provider=updated_user.get("auth_provider", "email"),
        created_at=updated_user["created_at"],
        organization=updated_user.get("organization")
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user
    
    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token from storage. This endpoint is for logging purposes.
    """
    logger.info(f"User logged out: {current_user['email']}")
    return MessageResponse(message="Logged out successfully")


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Refresh JWT token
    
    Returns a new token with extended expiry
    """
    # Create new token
    access_token = create_access_token(data={"sub": current_user["email"]})
    
    # Prepare response
    user_response = UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        profile_picture=current_user.get("profile_picture"),
        auth_provider=current_user.get("auth_provider", "email"),
        created_at=current_user["created_at"],
        organization=current_user.get("organization")
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request password reset
    
    Sends password reset email to user
    """
    try:
        users_collection = get_users_collection()
        
        # Find user by email
        user = await users_collection.find_one({"email": request.email})
        
        # Always return success message (security: don't reveal if email exists)
        if not user:
            logger.info(f"Password reset requested for non-existent email: {request.email}")
            return MessageResponse(
                message="If an account exists with this email, you will receive password reset instructions."
            )
        
        # Check if user uses Google OAuth
        if user.get("auth_provider") == "google":
            logger.info(f"Password reset requested for Google OAuth user: {request.email}")
            return MessageResponse(
                message="This account uses Google Sign-In. Please login with Google."
            )
        
        # Create password reset token (valid for 30 minutes)
        from datetime import timedelta
        reset_token = create_access_token(
            data={"sub": user["email"], "type": "password_reset"},
            expires_delta=timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
        )
        
        # Send password reset email
        email_sent = await send_password_reset_email(
            to_email=user["email"],
            reset_token=reset_token
        )
        
        if not email_sent:
            logger.error(f"Failed to send password reset email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email. Please try again later."
            )
        
        logger.info(f"Password reset email sent to {request.email}")
        
        return MessageResponse(
            message="If an account exists with this email, you will receive password reset instructions."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request. Please try again."
        )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password with token
    
    Validates token and updates user password
    """
    try:
        from app.utils.jwt_handler import verify_token
        
        # Verify reset token
        payload = verify_token(request.token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check token type
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        # Get email from token
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload"
            )
        
        users_collection = get_users_collection()
        
        # Find user
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user uses Google OAuth
        if user.get("auth_provider") == "google":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reset password for Google OAuth accounts"
            )
        
        # Hash new password
        hashed_password = hash_password(request.new_password)
        
        # Update password
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hashed_password}}
        )
        
        logger.info(f"Password reset successful for {email}")
        
        return MessageResponse(message="Password reset successful. You can now login with your new password.")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password. Please try again."
        )

