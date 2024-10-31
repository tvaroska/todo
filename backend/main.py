# main.py
import os
from datetime import datetime, timedelta
from typing import Optional, List

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI()
security = HTTPBearer()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: str
    google_id: Optional[str] = None
    role: str = "user"

class UserUpdate(BaseModel):
    role: str

class TokenData(BaseModel):
    email: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoogleAuthRequest(BaseModel):
    token: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

# JWT token functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        os.getenv("JWT_SECRET_KEY"), 
        algorithm=os.getenv("JWT_ALGORITHM", "HS256")
    )
    return encoded_jwt

def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET_KEY"),
            algorithms=[os.getenv("JWT_ALGORITHM", "HS256")]
        )
        return TokenData(email=payload["email"], role=payload["role"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@app.get("/api/users", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.post("/api/auth/google")
async def google_auth(auth_request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            auth_request.token, 
            requests.Request(), 
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        email = idinfo["email"]
        google_id = idinfo["sub"]
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                google_id=google_id,
                role="user"
            )
            db.add(user)
        
        # Update OAuth credentials
        if auth_request.access_token:
            user.oauth_access_token = auth_request.access_token
            # Typically access tokens expire in 1 hour
            user.oauth_token_expiry = datetime.utcnow() + timedelta(hours=1)
        
        if auth_request.refresh_token:
            user.oauth_refresh_token = auth_request.refresh_token
        
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token = create_access_token(
            data={"email": email, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user.email,
                "role": user.role
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

@app.put("/api/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    # Decode and verify token
    token_data = decode_token(credentials.credentials)
    
    # Check if user has admin role
    if token_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = user_update.role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@app.get("/api/users/{user_id}/oauth-status")
async def get_oauth_status(
    user_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    # Decode and verify token
    token_data = decode_token(credentials.credentials)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only allow users to check their own OAuth status or admins to check any user
    if token_data.email != user.email and token_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this information"
        )
    
    return {
        "has_valid_token": bool(user.oauth_access_token and user.oauth_token_expiry and user.oauth_token_expiry > datetime.utcnow()),
        "token_expiry": user.oauth_token_expiry,
        "has_refresh_token": bool(user.oauth_refresh_token)
    }
