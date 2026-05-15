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
    MessageResponse
)
from app.services.database import get_users_collection
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.middleware.auth_middleware import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Register new user with email and password
    
    - Validates email uniqueness
    - Hashes password with bcrypt
    - Creates user in MongoDB
    - Returns JWT token
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
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        # Create user document
        user_doc = {
            "name": request.name,
            "email": request.email,
            "password": hashed_password,
            "auth_provider": "email",
            "google_id": None,
            "profile_picture": None,
            "created_at": datetime.utcnow()
        }
        
        # Insert user
        result = await users_collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Create JWT token
        access_token = create_access_token(data={"sub": request.email})
        
        # Prepare response
        user_response = UserResponse(
            id=str(user_doc["_id"]),
            name=user_doc["name"],
            email=user_doc["email"],
            profile_picture=user_doc["profile_picture"],
            auth_provider=user_doc["auth_provider"],
            created_at=user_doc["created_at"]
        )
        
        logger.info(f"New user registered: {request.email}")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
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
            created_at=user["created_at"]
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
            created_at=user["created_at"]
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
        created_at=current_user["created_at"]
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
        created_at=current_user["created_at"]
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )
