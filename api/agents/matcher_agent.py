from typing import Dict, Any, List
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are an expert Resume-to-Job Requirements Matcher Agent.
Compare the extracted resume details against the extracted job requirements.

SUPPORT SYNONYMS & ACRONYMS:
- React.js -> React
- PostgreSQL -> Postgres
- Machine Learning -> ML
- Amazon Web Services -> AWS
- Python 3 -> Python
- Kubernetes -> K8s
- Node.js -> Node

DO NOT aggressively equate unrelated technologies (e.g. Java is NOT JavaScript, C++ is NOT C#).

Each requirement comparison MUST be categorized into one of:
- MATCHED (Full alignment or recognized synonym/acronym present in resume)
- PARTIAL (Related experience or transferable skill present, but missing exact depth)
- MISSING (No evidence in resume)

Return a JSON array under key "matches":
{
  "matches": [
    {
      "requirement": "5+ years of React experience",
      "type": "skill",
      "category": "required",
      "status": "MATCHED",
      "confidence": 0.95,
      "evidence": "Senior Frontend Developer at TechCorp (4 years React.js)",
      "details": "Recognized React.js as React equivalent with strong tenure."
    }
  ]
}
"""

def run_matcher_agent(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    prompt = f"Resume Data:\n{resume_data}\n\nJob Requirements Data:\n{job_data}"
    try:
        res = call_gemini_json(prompt, SYSTEM_INSTRUCTION)
        return res.get("matches", [])
    except Exception as e:
        print(f"[MatcherAgent Error]: {e}")
        # Fallback basic matching if AI call fails
        matches = []
        req_skills = job_data.get("required_skills", [])
        resume_skills = [s.lower() for s in resume_data.get("skills", [])]
        
        for req in req_skills:
            status = "MATCHED" if any(req.lower() in s or s in req.lower() for s in resume_skills) else "MISSING"
            matches.append({
                "requirement": req,
                "type": "skill",
                "category": "required",
                "status": status,
                "confidence": 0.9 if status == "MATCHED" else 0.8,
                "evidence": f"Found in resume skills list" if status == "MATCHED" else None,
                "details": f"Direct skill keyword comparison."
            })
        return matches
