from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password, 
    verify_password, 
    create_session_token, 
    get_current_user
)
from app.models.user import User
from app.schemas.user import (
    UserCreate, 
    UserLogin, 
    UserUpdate, 
    UserResponse, 
    AuthResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create new user
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue session cookie
    token = create_session_token(new_user.id)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        message="Registration successful. Session established."
    )

@router.post("/login", response_model=AuthResponse)
def login(login_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    # Set secure HTTP-only session cookie
    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Login successful."
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
    )
    return {"message": "Session invalidated and logged out successfully."}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=AuthResponse)
def update_profile(
    profile_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if profile_in.name:
        current_user.name = profile_in.name

    if profile_in.email and profile_in.email.lower() != current_user.email:
        # Check uniqueness
        other = db.query(User).filter(User.email == profile_in.email.lower()).first()
        if other:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already used by another account.",
            )
        current_user.email = profile_in.email.lower()

    if profile_in.new_password:
        if not profile_in.current_password or not verify_password(profile_in.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password verification failed.",
            )
        current_user.password_hash = hash_password(profile_in.new_password)

    db.commit()
    db.refresh(current_user)

    return AuthResponse(
        user=UserResponse.model_validate(current_user),
        message="Profile updated successfully."
    )
