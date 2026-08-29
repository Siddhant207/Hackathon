from typing import Dict, Any
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are an expert Resume Extraction Agent.
Your SOLE task is to extract candidate details from the provided resume text.

STRICT RULE:
- Extract ONLY information explicitly stated in the resume text.
- Do NOT invent or hallucinate candidate skills, companies, job titles, achievements, metrics, certifications, or education.
- If a section is not found in the resume, return an empty list or null for that field.

Return a JSON object with:
{
  "candidate": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "..."
  },
  "summary": "...",
  "experience": [
    {
      "company": "...",
      "title": "...",
      "dates": "...",
      "highlights": ["..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "year": "..."
    }
  ],
  "skills": ["..."],
  "projects": ["..."],
  "certifications": ["..."],
  "achievements": ["..."],
  "languages": ["..."],
  "links": ["..."]
}
"""

def run_resume_agent(resume_text: str) -> Dict[str, Any]:
    prompt = f"Resume Text:\n{resume_text}"
    try:
        return call_gemini_json(prompt, SYSTEM_INSTRUCTION)
    except Exception as e:
        print(f"[ResumeAgent Error]: {e}")
        # Return fallback structured dict if AI fails
        return {
            "candidate": {},
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            "languages": [],
            "links": []
        }
