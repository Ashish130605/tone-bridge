from fastapi import APIRouter

from app.api.routes import identify
from app.core.security import auth_backend, fastapi_users
from app.schemas import UserRead, UserCreate

api_router = APIRouter()

api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],)


api_router.include_router(identify.router)
