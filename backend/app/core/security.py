import uuid

from fastapi import Depends
from fastapi_users import UUIDIDMixin, BaseUserManager, schemas, models, InvalidPasswordException, FastAPIUsers
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, CookieTransport

from app.api.deps import get_user_db
from app.core.config import settings
from app.core.models import User
import re

PWD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.JWT_SECRET
    verification_token_secret  = settings.JWT_SECRET

    async def validate_password(
        self, password: str, user: schemas.UC | models.UP
    ) -> None:
        if re.match(PWD_REGEX, password) is None:
            raise InvalidPasswordException(
                reason="Password must contain at least 8 characters long with upper and lowercase characters and at least 1 special character"
            )

cookie_transport = CookieTransport(cookie_name="access_token",
                                   cookie_secure=False,
                                   cookie_max_age=3600)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.JWT_SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)
current_active_user = fastapi_users.current_user(active=True)

