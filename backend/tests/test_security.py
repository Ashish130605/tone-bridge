import pytest
from fastapi_users import InvalidPasswordException

from app.core.security import UserManager


@pytest.fixture
def manager():
    return UserManager(None)


VALID_PASSWORDS = [
    "Abcdef1!",
    "Str0ng@Pass",
    "P@ssw0rd123",
]

INVALID_PASSWORDS = [
    ("too short", "Ab1!x"),
    ("no lowercase", "ABCDEF1!"),
    ("no uppercase", "abcdef1!"),
    ("no digit", "Abcdefg!"),
    ("no special char", "Abcdefg1"),
    ("only letters", "Abcdefgh"),
    ("empty", ""),
    ("disallowed special char", "Abcdef1#"),
]


@pytest.mark.parametrize("password", VALID_PASSWORDS)
async def test_valid_password_passes(manager, password):
    assert await manager.validate_password(password, None) is None


@pytest.mark.parametrize("label, password", INVALID_PASSWORDS)
async def test_invalid_password_raises(manager, label, password):
    with pytest.raises(InvalidPasswordException):
        await manager.validate_password(password, None)


async def test_exception_carries_a_reason(manager):
    with pytest.raises(InvalidPasswordException) as exc_info:
        await manager.validate_password("weak", None)
    assert exc_info.value.reason
