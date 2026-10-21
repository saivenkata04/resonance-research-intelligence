import re
from datetime import timedelta
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Project, ProjectMember, generate_uuid
from app.core.security import verify_password, create_access_token, get_current_user, get_password_hash

router = APIRouter()

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$")


class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None
    role: Optional[str] = "researcher"


class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    clean_email = user_in.email.strip().lower()
    if not clean_email or not EMAIL_REGEX.match(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid institutional email address is required (e.g., name@university.edu)."
        )

    if not user_in.password or len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this institutional email already exists. Please sign in instead."
        )

    hashed_pw = get_password_hash(user_in.password)
    full_name = user_in.full_name.strip() if user_in.full_name else clean_email.split("@")[0].replace(".", " ").title()

    new_user = User(
        id=generate_uuid(),
        email=clean_email,
        hashed_password=hashed_pw,
        full_name=full_name,
        role=user_in.role or "researcher",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create a dedicated, private research workspace project for this user
    user_project = Project(
        id=generate_uuid(),
        name=f"{full_name}'s Research Workspace",
        description="Private scientific conflict and reproducibility repository",
        owner_id=new_user.id,
    )
    db.add(user_project)
    db.commit()
    db.refresh(user_project)

    member = ProjectMember(
        project_id=user_project.id,
        user_id=new_user.id,
        role="owner"
    )
    db.add(member)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "project_id": user_project.id,
        }
    }


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    clean_username = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == clean_username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact your system administrator.",
        )

    # Find the user's primary project
    primary_proj = db.query(Project).filter(Project.owner_id == user.id).first()
    if not primary_proj:
        membership = db.query(ProjectMember).filter(ProjectMember.user_id == user.id).first()
        primary_proj_id = membership.project_id if membership else None
    else:
        primary_proj_id = primary_proj.id

    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "project_id": primary_proj_id,
        }
    }


@router.get("/me")
def read_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    primary_proj = db.query(Project).filter(Project.owner_id == current_user.id).first()
    if not primary_proj:
        membership = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).first()
        primary_proj_id = membership.project_id if membership else None
    else:
        primary_proj_id = primary_proj.id

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "project_id": primary_proj_id,
    }


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    # Always return a safe success response to prevent email enumeration
    return {
        "message": "If an account with this institutional email exists, password recovery instructions have been dispatched."
    }
