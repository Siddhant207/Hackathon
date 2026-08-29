from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Plain text extracted from candidate resume")
    job_description: str = Field(..., description="Target job description text")

class RewriteRequest(BaseModel):
    original: str = Field(..., description="Original bullet point or section text to rewrite")
    job_description: str = Field("", description="Target job description for alignment context")
    mode: str = Field("conservative", description="Mode: conservative, strong, or achievement_focused")

class Scores(BaseModel):
    overall: int = Field(..., ge=0, le=100)
    skills: int = Field(..., ge=0, le=100)
    experience: int = Field(..., ge=0, le=100)
    responsibilities: int = Field(..., ge=0, le=100)
    education: int = Field(..., ge=0, le=100)
    seniority: int = Field(..., ge=0, le=100)
    soft_skills: int = Field(..., ge=0, le=100)
    ats: int = Field(..., ge=0, le=100)

class RequirementMatch(BaseModel):
    requirement: str
    type: str = Field("skill", description="skill, experience, education, responsibility, tech_stack")
    category: str = Field("required", description="required (MUST HAVE) or preferred (NICE TO HAVE)")
    status: str = Field("MATCHED", description="MATCHED, PARTIAL, or MISSING")
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    evidence: Optional[str] = None
    details: Optional[str] = None

class ATSAnalysis(BaseModel):
    score: int = Field(..., ge=0, le=100)
    contact_info_present: bool = True
    section_structure_score: int = 85
    keyword_coverage_score: int = 80
    formatting_issues: List[str] = []
    recommendations: List[str] = []
    disclaimer: str = "This score is an estimate based on standard parsing heuristics and not a guarantee of performance on all ATS systems."

class BulletImprovement(BaseModel):
    original: str
    improved: str
    reason: str
    metrics_added: bool = False

class AnalysisResponse(BaseModel):
    scores: Scores
    verdict: str
    matched_requirements: List[RequirementMatch] = []
    partial_requirements: List[RequirementMatch] = []
    missing_requirements: List[RequirementMatch] = []
    recommendations: List[str] = []
    bullet_improvements: List[BulletImprovement] = []
    interview_questions: List[str] = []
    evidence_quality: Dict[str, Any] = {}
    ats_analysis: Optional[ATSAnalysis] = None

class RewriteResponse(BaseModel):
    improved_text: str
    mode: str
    changes_made: List[str] = []
    notes: str = ""
