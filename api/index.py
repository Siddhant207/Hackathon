import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure api directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.routes.analyze import router as analyze_router

app = FastAPI(
    title="ResumeIQ Agent API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes with /api prefix
app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "ResumeIQ FastAPI Agent Server is running."}
