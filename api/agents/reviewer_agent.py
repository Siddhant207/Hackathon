from typing import Dict, Any, List
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are an Auditor & Quality Control Reviewer Agent.
Your job is to strictly verify the proposed matches against the raw candidate resume text.

CHECKLIST:
1. Did any agent invent a skill not in the resume?
2. Did any agent invent a metric or metric percentage?
3. Did any agent invent work experience or company names?
4. Did any agent claim evidence not present in the resume text?
5. Did any agent confuse preferred (nice-to-have) and required (must-have) skills?
6. Did any agent make an unreasonable semantic match (e.g. Java = JavaScript)?

If an unreasonable match or hallucinated evidence is found:
- Reclassify status to MISSING or PARTIAL.
- Adjust confidence down.
- Remove unsupported evidence text.

Return a JSON object:
{
  "verified_matches": [
    {
      "requirement": "...",
      "type": "...",
      "category": "...",
      "status": "MATCHED",
      "confidence": 0.9,
      "evidence": "...",
      "details": "..."
    }
  ],
  "audit_notes": ["Removed hallucinated metric claim", "..."]
}
"""

def run_reviewer_agent(
    raw_resume_text: str,
    raw_job_text: str,
    proposed_matches: List[Dict[str, Any]]
) -> Dict[str, Any]:
    prompt = (
        f"Raw Resume Text:\n{raw_resume_text}\n\n"
        f"Raw Job Description:\n{raw_job_text}\n\n"
        f"Proposed Matches:\n{proposed_matches}"
    )
    try:
        res = call_gemini_json(prompt, SYSTEM_INSTRUCTION)
        return {
            "verified_matches": res.get("verified_matches", proposed_matches),
            "audit_notes": res.get("audit_notes", [])
        }
    except Exception as e:
        print(f"[ReviewerAgent Error]: {e}")
        return {
            "verified_matches": proposed_matches,
            "audit_notes": []
        }
