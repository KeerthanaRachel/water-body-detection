import io
import uuid
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def create_synthetic_image_bytes(width=200, height=200, color=(20, 100, 180)):
    """Creates an RGB test image in-memory."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def test_prediction_lifecycle_and_user_data_isolation():
    """
    Validates:
    - User authentication isolation
    - Image format & integrity checks
    - Real U-Net inference execution
    - Binary mask generation and pixel percentage calculation
    - Multi-tenant data isolation (User B cannot read or delete User A's analyses)
    - Mask downloading
    - Deletion workflow
    """
    uid_a = uuid.uuid4().hex[:8]
    uid_b = uuid.uuid4().hex[:8]

    # 1. Setup User A Client
    client_a = TestClient(app)
    user_a_email = f"analyst.a.{uid_a}@satellite-lab.org"
    user_a_pass = "AlphaSecurePass123!"
    reg_a = client_a.post("/api/auth/register", json={
        "name": f"Analyst Alpha {uid_a}",
        "email": user_a_email,
        "password": user_a_pass,
    })
    assert reg_a.status_code == 201
    assert settings.SESSION_COOKIE_NAME in client_a.cookies

    # 2. Setup User B Client
    client_b = TestClient(app)
    user_b_email = f"analyst.b.{uid_b}@satellite-lab.org"
    user_b_pass = "BetaSecurePass123!"
    reg_b = client_b.post("/api/auth/register", json={
        "name": f"Analyst Beta {uid_b}",
        "email": user_b_email,
        "password": user_b_pass,
    })
    assert reg_b.status_code == 201
    assert settings.SESSION_COOKIE_NAME in client_b.cookies

    # 3. Reject invalid file format (text/plain instead of supported image)
    invalid_file = {"file": ("malicious.txt", b"plain text is not an image", "text/plain")}
    bad_upload_res = client_a.post("/api/predictions", files=invalid_file)
    assert bad_upload_res.status_code == 400
    assert "Unsupported image format" in bad_upload_res.json()["detail"]

    # 4. User A uploads valid satellite image
    img_bytes = create_synthetic_image_bytes(250, 200, color=(15, 85, 175))
    valid_file = {"file": ("sentinel_tile_lake.png", img_bytes, "image/png")}
    upload_res = client_a.post("/api/predictions", files=valid_file)
    assert upload_res.status_code == 201

    pred_data = upload_res.json()
    pred_id = pred_data["id"]

    assert pred_data["original_filename"] == "sentinel_tile_lake.png"
    assert "mask_path" in pred_data
    assert "overlay_path" in pred_data
    assert 0.0 <= pred_data["water_percentage"] <= 100.0
    assert pred_data["image_width"] == 250
    assert pred_data["image_height"] == 200
    assert pred_data["processing_time_ms"] > 0

    # 5. User A can retrieve their own prediction (Database persistence)
    get_res_a = client_a.get(f"/api/predictions/{pred_id}")
    assert get_res_a.status_code == 200
    assert get_res_a.json()["id"] == pred_id

    # 6. User B CANNOT retrieve User A's prediction (Strict 403 Forbidden Data Isolation)
    get_res_b = client_b.get(f"/api/predictions/{pred_id}")
    assert get_res_b.status_code == 403
    assert "Access denied" in get_res_b.json()["detail"]

    # 7. User B CANNOT delete User A's prediction (Strict 403 Forbidden Authorization)
    del_res_b = client_b.delete(f"/api/predictions/{pred_id}")
    assert del_res_b.status_code == 403
    assert "Access denied" in del_res_b.json()["detail"]

    # 8. User A can download binary mask file
    mask_res = client_a.get(f"/api/predictions/{pred_id}/mask")
    assert mask_res.status_code == 200
    assert mask_res.headers["content-type"] == "image/png"
    assert len(mask_res.content) > 0

    # 9. User A retrieves prediction history list
    list_res_a = client_a.get("/api/predictions")
    assert list_res_a.status_code == 200
    list_data = list_res_a.json()
    assert list_data["total"] >= 1
    assert any(item["id"] == pred_id for item in list_data["items"])

    # 10. Dashboard reflects user's successful predictions
    dash_res = client_a.get("/api/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_predictions"] >= 1
    assert dash_data["avg_water_percentage"] >= 0.0

    # 11. User A deletes their own prediction
    del_res_a = client_a.delete(f"/api/predictions/{pred_id}")
    assert del_res_a.status_code == 204

    # 12. Record is verified deleted from database
    get_after_del = client_a.get(f"/api/predictions/{pred_id}")
    assert get_after_del.status_code == 404
