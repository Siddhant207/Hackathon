import asyncio
from typing import Dict, Any
from api.agents.resume_agent import run_resume_agent
from api.agents.job_agent import run_job_agent
from api.agents.ats_agent import run_ats_agent
from api.agents.matcher_agent import run_matcher_agent
from api.agents.reviewer_agent import run_reviewer_agent
from api.agents.final_agent import run_final_agent
from api.tools.scoring import calculate_scores
from api.schemas.analysis import AnalysisResponse, RequirementMatch, ATSAnalysis, BulletImprovement, Scores

async def analyze_resume_and_job(resume_text: str, job_description: str) -> AnalysisResponse:
    """
    Orchestrate the multi-agent resume analysis pipeline:
    1. Run Resume Agent, Job Agent, and ATS Agent concurrently.
    2. Run Matcher Agent on extractions.
    3. Run Reviewer Agent to audit and filter matches.
    4. Compute deterministic score using Python scoring engine.
    5. Run Final Agent for recommendations, bullet improvements, and interview questions.
    """
    # Step 1: Concurrent execution of independent agents
    resume_task = asyncio.to_thread(run_resume_agent, resume_text)
    job_task = asyncio.to_thread(run_job_agent, job_description)
    ats_task = asyncio.to_thread(run_ats_agent, resume_text, job_description)

    resume_data, job_data, ats_data = await asyncio.gather(resume_task, job_task, ats_task)

    # Step 2: Matcher Agent
    proposed_matches = await asyncio.to_thread(run_matcher_agent, resume_data, job_data)

    # Step 3: Reviewer Agent (Quality Control Audit)
    reviewer_res = await asyncio.to_thread(
        run_reviewer_agent, resume_text, job_description, proposed_matches
    )
    verified_matches = reviewer_res.get("verified_matches", proposed_matches)

    # Step 4: Deterministic Python Scoring Calculation
    ats_score = int(ats_data.get("score", 85))
    scores_dict, verdict = calculate_scores(verified_matches, ats_score=ats_score)

    # Step 5: Final Agent Synthesis
    final_res = await asyncio.to_thread(
        run_final_agent, resume_data, job_data, verified_matches, scores_dict
    )

    # Categorize requirement matches for response
    matched_reqs = []
    partial_reqs = []
    missing_reqs = []

    for m in verified_matches:
        req_obj = RequirementMatch(
            requirement=m.get("requirement", ""),
            type=m.get("type", "skill"),
            category=m.get("category", "required"),
            status=m.get("status", "MISSING"),
            confidence=float(m.get("confidence", 1.0)),
            evidence=m.get("evidence"),
            details=m.get("details")
        )
        status = req_obj.status.upper()
        if status == "MATCHED":
            matched_reqs.append(req_obj)
        elif status == "PARTIAL":
            partial_reqs.append(req_obj)
        else:
            missing_reqs.append(req_obj)

    # Build Pydantic response model
    bullet_improvements = [
        BulletImprovement(
            original=b.get("original", ""),
            improved=b.get("improved", ""),
            reason=b.get("reason", ""),
            metrics_added=bool(b.get("metrics_added", False))
        )
        for b in final_res.get("bullet_improvements", [])
    ]

    ats_analysis = ATSAnalysis(
        score=ats_score,
        contact_info_present=bool(ats_data.get("contact_info_present", True)),
        section_structure_score=int(ats_data.get("section_structure_score", 85)),
        keyword_coverage_score=int(ats_data.get("keyword_coverage_score", 80)),
        formatting_issues=ats_data.get("formatting_issues", []),
        recommendations=ats_data.get("recommendations", []),
        disclaimer=ats_data.get("disclaimer", "Estimate only.")
    )

    return AnalysisResponse(
        scores=Scores(**scores_dict),
        verdict=verdict,
        matched_requirements=matched_reqs,
        partial_requirements=partial_reqs,
        missing_requirements=missing_reqs,
        recommendations=final_res.get("recommendations", []),
        bullet_improvements=bullet_improvements,
        interview_questions=final_res.get("interview_questions", []),
        evidence_quality=final_res.get("evidence_quality", {}),
        ats_analysis=ats_analysis
    )
