from typing import List, Dict, Any, Tuple

WEIGHTS = {
    "skills": 0.30,
    "experience": 0.20,
    "responsibilities": 0.15,
    "tech_stack": 0.15,
    "education": 0.10,
    "seniority": 0.05,
    "soft_skills": 0.05,
}

STATUS_MULTIPLIER = {
    "MATCHED": 1.0,
    "PARTIAL": 0.5,
    "MISSING": 0.0
}

CATEGORY_MAP = {
    "required_skills": "skills",
    "preferred_skills": "skills",
    "skill": "skills",
    "skills": "skills",
    "experience": "experience",
    "responsibilities": "responsibilities",
    "responsibility": "responsibilities",
    "technologies": "tech_stack",
    "tech_stack": "tech_stack",
    "education": "education",
    "seniority": "seniority",
    "soft_skills": "soft_skills"
}

def calculate_category_score(items: List[Dict[str, Any]]) -> int:
    """
    Calculate deterministic 0-100 score for a specific category of items.
    Considers required vs preferred weighting and status (MATCHED/PARTIAL/MISSING).
    """
    if not items:
        return 75  # Neutral baseline if no items defined in JD for this category

    total_weight = 0.0
    weighted_score = 0.0

    for item in items:
        cat_type = str(item.get("category", "required")).lower()
        item_weight = 1.5 if "required" in cat_type or "must" in cat_type else 1.0
        
        status = str(item.get("status", "MISSING")).upper()
        mult = STATUS_MULTIPLIER.get(status, 0.0)
        confidence = float(item.get("confidence", 1.0))
        
        effective_score = mult * confidence * 100.0
        
        total_weight += item_weight
        weighted_score += effective_score * item_weight

    if total_weight == 0:
        return 75

    raw_score = weighted_score / total_weight
    return max(0, min(100, int(round(raw_score))))

def calculate_scores(all_matches: List[Dict[str, Any]], ats_score: int = 85) -> Tuple[Dict[str, int], str]:
    """
    Calculate all subscores and overall score deterministically using fixed weights.
    Returns (scores_dict, verdict).
    """
    categorized: Dict[str, List[Dict[str, Any]]] = {
        "skills": [],
        "experience": [],
        "responsibilities": [],
        "tech_stack": [],
        "education": [],
        "seniority": [],
        "soft_skills": []
    }

    for item in all_matches:
        raw_type = str(item.get("type", "skill")).lower()
        target_cat = CATEGORY_MAP.get(raw_type, "skills")
        categorized[target_cat].append(item)

    subscores = {}
    for cat_name in WEIGHTS.keys():
        subscores[cat_name] = calculate_category_score(categorized[cat_name])

    # Overall score calculation using exact formula
    overall = sum(subscores[cat] * WEIGHTS[cat] for cat in WEIGHTS)
    overall_int = max(0, min(100, int(round(overall))))

    scores = {
        "overall": overall_int,
        "skills": subscores["skills"],
        "experience": subscores["experience"],
        "responsibilities": subscores["responsibilities"],
        "education": subscores["education"],
        "seniority": subscores["seniority"],
        "soft_skills": subscores["soft_skills"],
        "ats": ats_score
    }

    if overall_int >= 85:
        verdict = "Strong Match"
    elif overall_int >= 70:
        verdict = "Good Match"
    elif overall_int >= 55:
        verdict = "Moderate Match"
    else:
        verdict = "Weak Match"

    return scores, verdict
