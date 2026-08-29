from typing import Dict, Any, List
from api.config import call_gemini_json

SYSTEM_INSTRUCTION = """
You are the Final Synthesis Agent for ResumeIQ.
Given the verified requirement matches, candidate resume details, job requirements, ATS score, and calculated deterministic scores, generate actionable insights:

1. 3-5 high-impact actionable recommendations to improve the resume for this specific job.
2. 3-5 bullet point improvement suggestions (original vs improved with explanation).
3. 3-5 probable interview questions the candidate should prepare for based on missing or partial match areas.
4. Evidence quality summary.

STRICT RULE FOR BULLET IMPROVEMENTS:
- Never fabricate metrics. If metrics are missing, use placeholders like `[insert X% increase]` or `[insert $Y revenue]`.

Return a JSON object with:
{
  "recommendations": ["..."],
  "bullet_improvements": [
    {
      "original": "...",
      "improved": "...",
      "reason": "...",
      "metrics_added": false
    }
  ],
  "interview_questions": ["..."],
  "evidence_quality": {
    "quantified_achievements_ratio": "40%",
    "action_verb_strength": "High",
    "clarity_rating": "Strong"
  }
}
"""

REWRITE_SYSTEM_INSTRUCTION = """
You are an expert Resume Bullet Rewriter Agent for ResumeIQ.
Rewrite the provided bullet point or text snippet according to the specified mode:

MODES:
1. conservative: Improve grammar, action verbs, and structure using ONLY existing facts.
2. strong: Enhance impact and professional phrasing without inventing facts.
3. achievement_focused: Reframe as an accomplishment/result. Use placeholders like [insert X%] or [insert $Y] where real metrics are unavailable.

NEVER fabricate specific numbers, metrics, or company achievements.

Return a JSON object:
{
  "improved_text": "...",
  "mode": "...",
  "changes_made": ["Enhanced action verb from 'worked on' to 'Spearheaded'", "..."],
  "notes": "..."
}
"""

def run_final_agent(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
    matches: List[Dict[str, Any]],
    scores: Dict[str, int]
) -> Dict[str, Any]:
    prompt = (
        f"Scores:\n{scores}\n\n"
        f"Matches:\n{matches}\n\n"
        f"Candidate Resume Details:\n{resume_data}\n\n"
        f"Job Details:\n{job_data}"
    )
    try:
        return call_gemini_json(prompt, SYSTEM_INSTRUCTION)
    except Exception as e:
        print(f"[FinalAgent Error]: {e}")
        return {
            "recommendations": ["Tailor bullet points to match target job keywords."],
            "bullet_improvements": [],
            "interview_questions": ["Be prepared to discuss your experience with key required tools."],
            "evidence_quality": {"clarity_rating": "Moderate"}
        }

def run_rewrite_agent(original: str, job_description: str, mode: str) -> Dict[str, Any]:
    prompt = (
        f"Mode: {mode}\n\n"
        f"Original Text:\n{original}\n\n"
        f"Target Job Description:\n{job_description}"
    )
    try:
        return call_gemini_json(prompt, REWRITE_SYSTEM_INSTRUCTION)
    except Exception as e:
        print(f"[RewriteAgent Error]: {e}")
        return {
            "improved_text": original,
            "mode": mode,
            "changes_made": ["Preserved original text due to processing fallback"],
            "notes": str(e)
        }
