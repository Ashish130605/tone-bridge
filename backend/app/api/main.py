from fastapi import APIRouter
from app.api.routes import identify

api_router = APIRouter()
api_router.include_router(identify.router)
