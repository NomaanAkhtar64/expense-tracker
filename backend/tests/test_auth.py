import pytest

pytestmark = pytest.mark.asyncio

REGISTER_PAYLOAD = {"email": "user@example.com", "password": "supersecret123"}


async def register(client, email=REGISTER_PAYLOAD["email"], password=REGISTER_PAYLOAD["password"]):
    return await client.post("/auth/register", json={"email": email, "password": password})


async def test_register_success(client):
    response = await register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == REGISTER_PAYLOAD["email"]
    assert "hashed_password" not in body


async def test_register_duplicate_email_fails(client):
    first = await register(client)
    assert first.status_code == 201

    second = await register(client)
    assert second.status_code == 400


async def test_login_success(client):
    await register(client)

    response = await client.post("/auth/login", json=REGISTER_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


async def test_login_wrong_password_fails(client):
    await register(client)

    response = await client.post(
        "/auth/login", json={"email": REGISTER_PAYLOAD["email"], "password": "wrong-password"}
    )
    assert response.status_code == 401


async def test_me_with_valid_token(client):
    await register(client)
    login_response = await client.post("/auth/login", json=REGISTER_PAYLOAD)
    token = login_response.json()["access_token"]

    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == REGISTER_PAYLOAD["email"]


async def test_me_without_token_fails(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401
