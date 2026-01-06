#!/usr/bin/env python3
"""
Diagnostic script for Task 8 - Final Login/Register Testing + OAuth Audit

This script performs automated checks on:
- Environment variable configuration
- Database connectivity and user verification
- OAuth endpoint availability
- Admin user setup

Run from finity-auth-starter/backend directory:
    python ../.cursor/diagnostics/run_audit.py
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app.core.config import settings
    from app.core.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import verify_password
    from app.services.oauth_service import OAuthService
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running from the correct directory and dependencies are installed")
    sys.exit(1)

# ANSI color codes
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"


def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")


def print_success(text: str):
    """Print success message."""
    print(f"{GREEN}✅ {text}{RESET}")


def print_error(text: str):
    """Print error message."""
    print(f"{RED}❌ {text}{RESET}")


def print_warning(text: str):
    """Print warning message."""
    print(f"{YELLOW}⚠️  {text}{RESET}")


def print_info(text: str):
    """Print info message."""
    print(f"{BLUE}ℹ️  {text}{RESET}")


def check_env_variables() -> Dict[str, bool]:
    """Check if required environment variables are set."""
    print_header("1. Environment Variables Check")
    
    results = {}
    required_vars = {
        "DATABASE_URL": settings.DATABASE_URL,
        "JWT_SECRET_KEY": settings.JWT_SECRET_KEY,
        "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
        "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET,
        "DISCORD_CLIENT_ID": settings.DISCORD_CLIENT_ID,
        "DISCORD_CLIENT_SECRET": settings.DISCORD_CLIENT_SECRET,
        "TWITTER_CLIENT_ID": settings.TWITTER_CLIENT_ID,
        "TWITTER_CLIENT_SECRET": settings.TWITTER_CLIENT_SECRET,
        "ADMIN_EMAIL": settings.ADMIN_EMAIL,
        "ADMIN_PASSWORD": settings.ADMIN_PASSWORD,
        "FRONTEND_URL": settings.FRONTEND_URL,
        "BACKEND_URL": settings.BACKEND_URL,
    }
    
    for var_name, var_value in required_vars.items():
        if var_value:
            if var_name in ["GOOGLE_CLIENT_SECRET", "DISCORD_CLIENT_SECRET", 
                           "TWITTER_CLIENT_SECRET", "ADMIN_PASSWORD", "JWT_SECRET_KEY"]:
                # Mask sensitive values
                display_value = f"{'*' * min(20, len(str(var_value)))} (hidden)"
            else:
                display_value = str(var_value)[:50]
            print_success(f"{var_name}: {display_value}")
            results[var_name] = True
        else:
            print_error(f"{var_name}: NOT SET")
            results[var_name] = False
    
    return results


def check_database_connection() -> bool:
    """Check if database connection works."""
    print_header("2. Database Connection Check")
    
    try:
        db = SessionLocal()
        # Try a simple query
        db.execute("SELECT 1")
        db.close()
        print_success("Database connection successful")
        return True
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        print_info("Make sure PostgreSQL is running and DATABASE_URL is correct")
        return False


def check_admin_user() -> Tuple[bool, Dict]:
    """Check if admin user exists in database."""
    print_header("3. Admin User Check")
    
    try:
        db = SessionLocal()
        
        # Check if admin email is configured
        if not settings.ADMIN_EMAIL:
            print_warning("ADMIN_EMAIL not set in environment")
            db.close()
            return False, {}
        
        # Query admin user
        admin_user = db.query(User).filter(
            User.email == settings.ADMIN_EMAIL,
            User.role == UserRole.ADMIN
        ).first()
        
        if admin_user:
            print_success(f"Admin user found: {admin_user.email}")
            print_info(f"  - Role: {admin_user.role}")
            print_info(f"  - Verified: {admin_user.is_verified}")
            print_info(f"  - Active: {admin_user.is_active}")
            print_info(f"  - Has Password: {'Yes' if admin_user.hashed_password else 'No'}")
            
            # Test password if set
            if admin_user.hashed_password and settings.ADMIN_PASSWORD:
                try:
                    from app.core.security import verify_password
                    password_valid = verify_password(settings.ADMIN_PASSWORD, admin_user.hashed_password)
                    if password_valid:
                        print_success("Admin password verification: SUCCESS")
                    else:
                        print_error("Admin password verification: FAILED (password mismatch)")
                except Exception as e:
                    print_warning(f"Could not verify password: {e}")
            
            db.close()
            return True, {
                "email": admin_user.email,
                "role": admin_user.role.value,
                "is_verified": admin_user.is_verified,
                "is_active": admin_user.is_active
            }
        else:
            print_error(f"Admin user not found with email: {settings.ADMIN_EMAIL}")
            
            # Check if email exists as regular user
            regular_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
            if regular_user:
                print_warning(f"User exists but is not admin (role: {regular_user.role})")
            
            db.close()
            return False, {}
            
    except Exception as e:
        print_error(f"Error checking admin user: {e}")
        return False, {}


def check_all_users() -> List[Dict]:
    """List all users in database."""
    print_header("4. All Users in Database")
    
    try:
        db = SessionLocal()
        users = db.query(User).all()
        
        if not users:
            print_warning("No users found in database")
            db.close()
            return []
        
        print_info(f"Total users: {len(users)}")
        print("\n" + "-" * 80)
        print(f"{'Email':<40} {'Role':<10} {'Verified':<10} {'Active':<10}")
        print("-" * 80)
        
        user_list = []
        for user in users:
            auth_type = "OAuth" if not user.hashed_password else "Password"
            print(f"{user.email:<40} {user.role.value:<10} {str(user.is_verified):<10} {str(user.is_active):<10}")
            user_list.append({
                "email": user.email,
                "role": user.role.value,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
                "auth_type": auth_type
            })
        
        print("-" * 80)
        db.close()
        return user_list
        
    except Exception as e:
        print_error(f"Error listing users: {e}")
        return []


def check_oauth_configuration() -> Dict[str, bool]:
    """Check OAuth provider configuration."""
    print_header("5. OAuth Configuration Check")
    
    results = {}
    providers = ["google", "discord", "twitter"]
    
    for provider in providers:
        print(f"\n{BLUE}Checking {provider.upper()} OAuth:{RESET}")
        
        # Check if authorization URL can be generated
        auth_url = OAuthService.get_oauth_authorization_url(provider)
        
        if auth_url:
            print_success(f"{provider.capitalize()} OAuth URL generated")
            print_info(f"  URL: {auth_url[:80]}...")
            
            # Check callback URL
            callback_urls = {
                "google": f"{settings.BACKEND_URL}/api/auth/social/google/callback",
                "discord": f"{settings.BACKEND_URL}/api/auth/social/discord/callback",
                "twitter": f"{settings.BACKEND_URL}/api/auth/social/twitter/callback"
            }
            print_info(f"  Callback: {callback_urls[provider]}")
            results[provider] = True
        else:
            print_error(f"{provider.capitalize()} OAuth not configured")
            print_info("  Check if CLIENT_ID and CLIENT_SECRET are set in .env")
            results[provider] = False
    
    return results


def check_oauth_callbacks() -> Dict[str, str]:
    """Check OAuth callback URLs."""
    print_header("6. OAuth Callback URLs")
    
    callbacks = {
        "google": f"{settings.BACKEND_URL}/api/auth/social/google/callback",
        "discord": f"{settings.BACKEND_URL}/api/auth/social/discord/callback",
        "twitter": f"{settings.BACKEND_URL}/api/auth/social/twitter/callback"
    }
    
    print_info("These URLs must be registered in your OAuth provider dashboards:")
    for provider, url in callbacks.items():
        print(f"  {provider.capitalize()}: {url}")
    
    return callbacks


def generate_summary(env_results: Dict, db_connected: bool, admin_exists: bool, 
                    oauth_results: Dict, users: List[Dict], admin_info: Dict):
    """Generate final summary report."""
    print_header("7. Summary Report")
    
    # Count successes
    env_ok = sum(1 for v in env_results.values() if v)
    env_total = len(env_results)
    oauth_ok = sum(1 for v in oauth_results.values() if v)
    oauth_total = len(oauth_results)
    
    # Count users by role
    admin_count = sum(1 for u in users if u.get("role") == "admin")
    regular_count = sum(1 for u in users if u.get("role") == "user")
    verified_count = sum(1 for u in users if u.get("is_verified", False))
    unverified_count = len(users) - verified_count
    
    print(f"{BOLD}Environment Variables:{RESET} {env_ok}/{env_total} set")
    print(f"{BOLD}Database Connection:{RESET} {'✅' if db_connected else '❌'}")
    print(f"{BOLD}Admin User Exists:{RESET} {'✅' if admin_exists else '❌'}")
    print(f"{BOLD}OAuth Providers:{RESET} {oauth_ok}/{oauth_total} configured")
    print(f"{BOLD}Total Users:{RESET} {len(users)}")
    
    print(f"\n{BOLD}Status:{RESET}")
    if db_connected and admin_exists and env_ok >= 8:
        print_success("System appears to be properly configured")
        overall_status = "success"
    elif db_connected and env_ok >= 6:
        print_warning("Some issues detected - review the report above")
        overall_status = "warning"
    else:
        print_error("Critical issues detected - system may not function properly")
        overall_status = "error"
    
    print(f"\n{BOLD}Next Steps:{RESET}")
    print("1. Verify OAuth callback URLs are registered in provider dashboards")
    print("2. Test login with admin credentials")
    print("3. Test OAuth login buttons in frontend")
    print("4. Test email verification flow")
    
    # Generate JSON report
    json_report = {
        "environment_variables": {
            "status": "success" if env_ok == env_total else ("warning" if env_ok >= 8 else "error"),
            "total": env_total,
            "set": env_ok,
            "missing": [k for k, v in env_results.items() if not v]
        },
        "database_connection": {
            "status": "success" if db_connected else "error",
            "message": "Database connection successful" if db_connected else "Database connection failed"
        },
        "admin_user": {
            "status": "success" if admin_exists else "error",
            "exists": admin_exists,
            "email": admin_info.get("email", settings.ADMIN_EMAIL if hasattr(settings, 'ADMIN_EMAIL') else ""),
            "role": admin_info.get("role", ""),
            "is_verified": admin_info.get("is_verified", False),
            "is_active": admin_info.get("is_active", False)
        },
        "oauth_configuration": {
            "status": "success" if oauth_ok == oauth_total else ("warning" if oauth_ok > 0 else "error"),
            "google": oauth_results.get("google", False),
            "discord": oauth_results.get("discord", False),
            "twitter": oauth_results.get("twitter", False)
        },
        "users_summary": {
            "total": len(users),
            "admin_count": admin_count,
            "regular_count": regular_count,
            "verified_count": verified_count,
            "unverified_count": unverified_count
        },
        "overall_status": overall_status
    }
    
    print(f"\n{BOLD}{BLUE}JSON Report:{RESET}")
    print(json.dumps(json_report, indent=2))
    
    return json_report


def main():
    """Run all diagnostic checks."""
    print(f"\n{BOLD}{BLUE}")
    print("=" * 60)
    print("  Authentication System Diagnostic Report")
    print("  Task 8 - Final Login/Register + OAuth Audit")
    print("=" * 60)
    print(f"{RESET}\n")
    
    # Run checks
    env_results = check_env_variables()
    db_connected = check_database_connection()
    
    admin_exists = False
    admin_info = {}
    users = []
    
    if db_connected:
        admin_exists, admin_info = check_admin_user()
        users = check_all_users()
    else:
        print_warning("Skipping database checks due to connection failure")
    
    oauth_results = check_oauth_configuration()
    callbacks = check_oauth_callbacks()
    
    # Generate summary
    json_report = generate_summary(env_results, db_connected, admin_exists, oauth_results, users, admin_info)
    
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}Diagnostic complete!{RESET}\n")


if __name__ == "__main__":
    main()
