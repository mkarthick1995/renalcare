"""
RenalCare AI - LLM-Powered Health Goals
Calls Claude Haiku with tightly bounded token limits to keep cost predictable.
Falls back to a free rule-based generator if ENABLE_LLM_GOALS=false or the API call fails.
"""
import json
import anthropic

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 400  # hard cap — keeps each call's cost small and predictable


def generate_llm_goals(patient_stats: dict) -> dict:
    """
    patient_stats example:
    {
      "name": "...", "risk_percentage": 42.0, "risk_level": "Moderate",
      "hydration_compliance": 68.0, "stone_type": "calcium_oxalate",
      "latest_scan_severity": "mild"
    }
    Returns: {"motivational_line": str, "goals": [{"title", "description", "category"}, ...]}
    """
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env automatically

    prompt = f"""You are a kidney health assistant. Based on this patient's data, generate
exactly 4 short, specific, actionable health goals and one brief motivational line.

Patient data:
{json.dumps(patient_stats, indent=2)}

Respond ONLY with valid JSON in this exact shape, no other text:
{{
  "motivational_line": "...",
  "goals": [
    {{"title": "...", "description": "...", "category": "hydration|diet|monitoring|lifestyle"}},
    ...
  ]
}}"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text
    return json.loads(text)


def generate_fallback_goals(patient_stats: dict) -> dict:
    """Free, rule-based fallback — same style as get_health_recommendations() in main.py."""
    goals = []
    if patient_stats.get("hydration_compliance", 100) < 80:
        goals.append({
            "title": "Boost daily hydration",
            "description": "Aim for at least 80% of your daily water goal for the next 7 days.",
            "category": "hydration",
        })
    if patient_stats.get("risk_level") in ("Moderate", "High"):
        goals.append({
            "title": "Schedule a follow-up",
            "description": "Book a consultation with your nephrologist this month.",
            "category": "monitoring",
        })
    goals.append({
        "title": "Log every meal",
        "description": "Track meals daily to keep oxalate and sodium intake visible.",
        "category": "diet",
    })
    goals.append({
        "title": "Stay consistent",
        "description": "Keep up your current hydration and diet routine.",
        "category": "lifestyle",
    })
    return {
        "motivational_line": "Small consistent habits add up to real recovery progress.",
        "goals": goals,
    }
