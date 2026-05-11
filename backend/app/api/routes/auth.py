"""
Authentication Routes
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import HTTPBearer
import hashlib
from datetime import datetime
from loguru import logger
from app.services.database import get_users_collection
from pydantic import BaseModel, EmailStr

router = APIRouter()
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return hash_password(plain_password) == hashed_password

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", tags=["Auth"])
async def register(user: UserRegister):
    """Register new user"""
    try:
        users_collection = get_users_collection()
        
        # Check if user exists
        existing = await users_collection.find_one({"email": user.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user.password)
        
        # Create user
        await users_collection.insert_one({
            "email": user.email,
            "username": user.username,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow()
        })
        
        return {"message": "User registered successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", tags=["Auth"])
async def login(user: UserLogin):
    """Login user"""
    try:
        users_collection = get_users_collection()
        
        # Find user
        db_user = await users_collection.find_one({"email": user.email})
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "message": "Login successful",
            "user": {
                "email": db_user["email"],
                "username": db_user["username"]
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")
