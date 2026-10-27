import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def test_health_endpoint():
    """Verify health endpoint and U-Net model readiness."""
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["unet_model"]["loaded"] is True
    assert data["unet_model"]["decision_threshold"] == 0.5
    assert data["unet_model"]["input_size"] == 128

def test_auth_registration_and_login_flow():
    """Test full authentication lifecycle: register, duplicate handling, login, session, logout."""
    client = TestClient(app)
    uid = uuid.uuid4().hex[:8]
    email = f"user.{uid}@satellite-lab.org"
    password = "SecurePassword123!"

    # 1. Register new user
    reg_res = client.post("/api/auth/register", json={
        "name": f"Dr. Test Flow {uid}",
        "email": email,
        "password": password
    })
    assert reg_res.status_code == 201
    assert reg_res.json()["user"]["email"] == email
    assert settings.SESSION_COOKIE_NAME in client.cookies

    # 2. Duplicate registration rejected with 400
    dup_res = client.post("/api/auth/register", json={
        "name": "Dr. Duplicate",
        "email": email,
        "password": password
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 3. Invalid credentials rejected with 401
    bad_client = TestClient(app)
    fail_res = bad_client.post("/api/auth/login", json={
        "email": email,
        "password": "IncorrectPassword999!"
    })
    assert fail_res.status_code == 401
    assert "Invalid email or password" in fail_res.json()["detail"]

    # 4. Valid login succeeds and establishes session cookie
    login_client = TestClient(app)
    login_res = login_client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    assert settings.SESSION_COOKIE_NAME in login_client.cookies

    # 5. Access protected /api/auth/me with session
    me_res = login_client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # 6. Logout invalidates cookie
    logout_res = login_client.post("/api/auth/logout")
    assert logout_res.status_code == 200

def test_unauthenticated_protected_endpoint():
    """Ensure accessing protected routes without session cookie is rejected with 401."""
    client = TestClient(app)
    res = client.get("/api/dashboard")
    assert res.status_code == 401
    assert "Not authenticated" in res.json()["detail"]

def test_profile_update_and_validation():
    """Test updating permitted user profile fields and password change validation."""
    client = TestClient(app)
    uid = uuid.uuid4().hex[:8]
    email = f"profile.{uid}@satellite-lab.org"
    password = "InitialPassword123!"

    reg = client.post("/api/auth/register", json={
        "name": "Original Name",
        "email": email,
        "password": password
    })
    assert reg.status_code == 201
    assert settings.SESSION_COOKIE_NAME in client.cookies

    # Update name
    update_res = client.put("/api/auth/profile", json={"name": "Dr. Updated Name"})
    assert update_res.status_code == 200
    assert update_res.json()["user"]["name"] == "Dr. Updated Name"

    # Password change with wrong current password must fail with 400
    bad_pass_res = client.put("/api/auth/profile", json={
        "current_password": "WrongOldPassword",
        "new_password": "BrandNewPassword123!"
    })
    assert bad_pass_res.status_code == 400

    # Password change with correct current password succeeds
    good_pass_res = client.put("/api/auth/profile", json={
        "current_password": password,
        "new_password": "BrandNewPassword123!"
    })
    assert good_pass_res.status_code == 200
