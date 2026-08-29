from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Optional
from api.schemas.analysis import (
    AnalyzeRequest,
    AnalysisResponse,
    RewriteRequest,
    RewriteResponse
)
from api.agents.orchestrator import analyze_resume_and_job
from api.agents.final_agent import run_rewrite_agent
from api.tools.resume_parser import extract_text_from_file

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "resumeiq"
    }

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(payload: AnalyzeRequest):
    resume_text = payload.resume_text.strip()
    job_desc = payload.job_description.strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    if not job_desc:
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        response = await analyze_resume_and_job(resume_text, job_desc)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"[Analyze Endpoint Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_endpoint(payload: RewriteRequest):
    original = payload.original.strip()
    if not original:
        raise HTTPException(status_code=400, detail="Original text cannot be empty.")

    mode = payload.mode.lower()
    if mode not in ["conservative", "strong", "achievement_focused"]:
        mode = "conservative"

    try:
        result = run_rewrite_agent(original, payload.job_description, mode)
        return RewriteResponse(
            improved_text=result.get("improved_text", original),
            mode=mode,
            changes_made=result.get("changes_made", []),
            notes=result.get("notes", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rewrite failed: {str(e)}")

@router.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        extracted_text = extract_text_from_file(contents, file.filename or "file.txt")
        if not extracted_text:
            raise HTTPException(status_code=400, detail="No readable text could be extracted from file.")
        return {
            "filename": file.filename,
            "resume_text": extracted_text
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume file: {str(e)}")
