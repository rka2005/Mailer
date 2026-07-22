import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routes
from routes.upload import router as upload_router

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# =====================================================
# FastAPI App
# =====================================================

app = FastAPI(
    title="Mail Automation API",
    version="1.0.0",
    description="Backend API for Mail Automation System"
)

# =====================================================
# CORS
# =====================================================

origins = [
    "http://localhost:5173",   # React + Vite
    "http://127.0.0.1:5173",   # React + Vite alternate host
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Health Check
# =====================================================

@app.get("/")
def root():
    return {
        "status": "Running",
        "message": "Mail Automation Backend"
    }

# =====================================================
# Routes
# =====================================================

app.include_router(upload_router)