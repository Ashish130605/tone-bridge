import os

os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("AUDD_API_TOKEN", "test-token")
os.environ.setdefault("AUDD_API_URL", "https://api.audd.test/")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
