from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.models import User, Project, ProjectMember


def check_project_access(
    project_id: str,
    user: User,
    db: Session,
    required_role: str = "viewer"
) -> Project:
    """Enforce project membership, ownership, or admin privileges."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )

    # Admin or project owner always has access
    if user.role == "admin" or project.owner_id == user.id:
        return project

    # Check project membership
    membership = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you are not authorized to access this research workspace."
        )

    if required_role == "owner" and membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: owner permissions required."
        )

    return project


def get_user_accessible_project_ids(user: User, db: Session) -> list[str]:
    """Return all project IDs owned by or shared with the user."""
    if user.role == "admin":
        return [p.id for p in db.query(Project.id).all()]

    owned = [p.id for p in db.query(Project.id).filter(Project.owner_id == user.id).all()]
    member_of = [m.project_id for m in db.query(ProjectMember.project_id).filter(ProjectMember.user_id == user.id).all()]
    return list(set(owned + member_of))


def resolve_user_project_id(user: User, requested_project_id: str | None, db: Session) -> str:
    """Resolve an authorized project ID for user actions, defaulting to their private workspace."""
    if requested_project_id and requested_project_id not in ("default", ""):
        check_project_access(requested_project_id, user, db)
        return requested_project_id

    # Fallback to user's primary owned workspace
    primary = db.query(Project).filter(Project.owner_id == user.id).first()
    if primary:
        return primary.id

    membership = db.query(ProjectMember).filter(ProjectMember.user_id == user.id).first()
    if membership:
        return membership.project_id

    # Create new personal project if none exists
    new_proj = Project(
        name=f"{user.full_name or 'Researcher'}'s Workspace",
        description="Private scientific conflict and reproducibility repository",
        owner_id=user.id,
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    member = ProjectMember(project_id=new_proj.id, user_id=user.id, role="owner")
    db.add(member)
    db.commit()
    return new_proj.id
