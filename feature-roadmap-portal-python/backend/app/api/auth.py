import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    # Set HTTP-Only access_token cookie (15m)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=15 * 60,
        samesite="lax",
        secure=False # Set to True in production HTTPS
    )
    # Set HTTP-Only refresh_token cookie (7d)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False
    )

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )
    
    # Generate email verification token simulation
    verif_token = str(uuid.uuid4())
    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.email}"
    
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        avatar_url=avatar_url,
        role=UserRole.USER,
        is_verified=False,
        verification_token=verif_token
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/verify-email")
async def verify_email(req: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == req.verification_token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token.")
    
    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified successfully."}

@router.post("/login", response_model=TokenResponse)
async def login(
    user_in: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    set_auth_cookies(response, access_token, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        # Try header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header.split(" ")[1]
            
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing."
        )
        
    payload = decode_refresh_token(refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
        
    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    # Rotate tokens
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    
    set_auth_cookies(response, new_access_token, new_refresh_token)
    
    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        user=user
    )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user:
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        await db.commit()
        return {
            "message": "Password reset simulation token generated.",
            "reset_token": reset_token # Simulated for demo/assessment purposes
        }
    return {"message": "If email exists, reset instructions have been generated."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.reset_token == req.reset_token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
    
    user.password_hash = get_password_hash(req.new_password)
    user.reset_token = None
    await db.commit()
    return {"message": "Password reset successfully. You can now login with your new password."}
