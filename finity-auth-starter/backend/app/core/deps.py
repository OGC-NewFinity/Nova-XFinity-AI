"""
Dependency functions for FastAPI routes.
Provides role-based access control and user authentication dependencies.
"""
from fastapi import Depends, HTTPException, status
from app.routes.auth import get_current_user
from app.models.user import User, UserRole


def require_role(required_role: UserRole):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.get("/admin-only")
        def admin_route(current_user: User = Depends(require_role(UserRole.ADMIN))):
            return {"message": "Admin access granted"}
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return current_user
    
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency for admin-only routes.
    
    Usage:
        @router.get("/admin-only")
        def admin_route(current_user: User = Depends(require_admin)):
            return {"message": "Admin access granted"}
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )
    return current_user
