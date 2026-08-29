from typing import Dict, Any
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are an expert Job Description Analyzer Agent.
Your task is to parse the job description and extract key candidate requirements.

STRICT RULE:
- Clearly distinguish between MUST HAVE (required) and NICE TO HAVE (preferred) requirements.
- Never convert a preferred requirement into a mandatory requirement.

Return a JSON object with:
{
  "company": "...",
  "title": "...",
  "seniority": "...",
  "required_skills": ["..."],
  "preferred_skills": ["..."],
  "responsibilities": ["..."],
  "education_requirements": ["..."],
  "experience_requirements": ["..."],
  "certifications": ["..."],
  "soft_skills": ["..."],
  "technologies": ["..."],
  "keywords": ["..."]
}
"""

def run_job_agent(job_description: str) -> Dict[str, Any]:
    prompt = f"Job Description:\n{job_description}"
    try:
        return call_gemini_json(prompt, SYSTEM_INSTRUCTION)
    except Exception as e:
        print(f"[JobAgent Error]: {e}")
        return {
            "company": "Unknown",
            "title": "Target Role",
            "seniority": "Mid-Senior",
            "required_skills": [],
            "preferred_skills": [],
            "responsibilities": [],
            "education_requirements": [],
            "experience_requirements": [],
            "certifications": [],
            "soft_skills": [],
            "technologies": [],
            "keywords": []
        }
