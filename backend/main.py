# main.py
import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.post("/api/auth/google")
async def google_auth(token: str, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
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
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = user_update.role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user