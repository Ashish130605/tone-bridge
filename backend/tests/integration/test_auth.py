import pytest

pytestmark = [pytest.mark.integration, pytest.mark.asyncio(loop_scope="session")]

EMAIL = "user@example.com"
PASSWORD = "Str0ng@Pass"


async def register(client, email=EMAIL, password=PASSWORD):
    return await client.post("/auth/register", json={"email": email, "password": password})


async def login(client, email=EMAIL, password=PASSWORD):
    return await client.post(
        "/auth/jwt/login", data={"username": email, "password": password}
    )


async def test_register_creates_user(client):
    resp = await register(client)

    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == EMAIL
    assert "id" in body
    assert "password" not in body


async def test_register_weak_password_rejected(client):
    resp = await register(client, password="weak")
    assert resp.status_code == 400


async def test_register_duplicate_email_rejected(client):
    await register(client)
    resp = await register(client)
    assert resp.status_code == 400


async def test_login_sets_cookie(client):
    await register(client)
    resp = await login(client)

    assert resp.status_code == 204
    assert client.cookies.get("access_token")


async def test_login_wrong_password_rejected(client):
    await register(client)
    resp = await login(client, password="Wr0ng@Pass")
    assert resp.status_code == 400


async def test_me_requires_authentication(client):
    resp = await client.get("/users/me")
    assert resp.status_code == 401


async def test_me_returns_current_user_when_logged_in(client):
    await register(client)
    await login(client)

    resp = await client.get("/users/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == EMAIL


async def test_logout_clears_session(client):
    await register(client)
    await login(client)
    assert (await client.get("/users/me")).status_code == 200

    logout = await client.post("/auth/jwt/logout")
    assert logout.status_code == 204
    assert (await client.get("/users/me")).status_code == 401


async def test_full_auth_lifecycle(client):
    assert (await register(client)).status_code == 201
    assert (await login(client)).status_code == 204

    me = await client.get("/users/me")
    assert me.status_code == 200
    assert me.json()["email"] == EMAIL

    assert (await client.post("/auth/jwt/logout")).status_code == 204
    assert (await client.get("/users/me")).status_code == 401
