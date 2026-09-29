"""Integration tests that the feature routes are guarded by current_active_user.

Requires Docker. Run with:  uv run pytest -m integration
"""
import pytest

pytestmark = [pytest.mark.integration, pytest.mark.asyncio(loop_scope="session")]

EMAIL = "guard@example.com"
PASSWORD = "Str0ng@Pass"


async def _register_and_login(client):
    await client.post("/auth/register", json={"email": EMAIL, "password": PASSWORD})
    await client.post("/auth/jwt/login", data={"username": EMAIL, "password": PASSWORD})


async def test_history_requires_auth(client):
    resp = await client.get("/api/history")
    assert resp.status_code == 401


async def test_recognise_requires_auth(client):
    # A valid multipart file is sent so body validation passes and the 401 comes
    # from the auth dependency, not from a missing-file 422.
    files = {"file": ("clip.wav", b"fake-audio-bytes", "audio/wav")}
    resp = await client.post("/api/recognise", files=files)
    assert resp.status_code == 401


async def test_history_returns_empty_for_authenticated_new_user(client):
    await _register_and_login(client)

    resp = await client.get("/api/history")
    assert resp.status_code == 200
    assert resp.json() == []
