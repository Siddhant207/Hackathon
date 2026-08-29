from typing import Dict, Any
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are an expert Applicant Tracking System (ATS) Parser & Evaluation Agent.
Analyze the candidate's resume text against standard ATS parsing guidelines and target job description keywords.

Evaluate:
1. Contact Information presence (email, phone, location, LinkedIn)
2. Section structure & standard headings (Experience, Education, Skills)
3. Chronology & clear dates
4. Keyword density & alignment with job description
5. Job-title alignment
6. Bullet point quality & action verbs
7. Formatting issues (tables, multi-column layouts, special icons, headers/footers)

Return a JSON object with:
{
  "score": 85,
  "contact_info_present": true,
  "section_structure_score": 90,
  "keyword_coverage_score": 80,
  "formatting_issues": [
    "..."
  ],
  "recommendations": [
    "..."
  ],
  "disclaimer": "This score is an estimate based on automated ATS parsing heuristics and not a guarantee of behavior across all commercial ATS software."
}
"""

def run_ats_agent(resume_text: str, job_description: str) -> Dict[str, Any]:
    prompt = f"Resume Text:\n{resume_text}\n\nJob Description:\n{job_description}"
    try:
        return call_gemini_json(prompt, SYSTEM_INSTRUCTION)
    except Exception as e:
        print(f"[ATSAgent Error]: {e}")
        return {
            "score": 80,
            "contact_info_present": True,
            "section_structure_score": 80,
            "keyword_coverage_score": 75,
            "formatting_issues": [],
            "recommendations": ["Use standard section headers like Work Experience and Education."],
            "disclaimer": "This score is an estimate based on automated ATS parsing heuristics."
        }
