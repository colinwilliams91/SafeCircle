def build_guardian_summary(signals):
    """
    Build a privacy-preserving summary for guardians.
    Does NOT expose original messages.
    """

    if not signals:
        return {
            "risk_level": "none",
            "alerts": 0,
            "message": "No safety signals detected."
        }

    high = 0
    medium = 0
    low = 0

    for s in signals:
        if s.risk_level == "high":
            high += 1
        elif s.risk_level == "medium":
            medium += 1
        else:
            low += 1

    if high > 0:
        overall = "high"
    elif medium > 0:
        overall = "medium"
    else:
        overall = "low"

    return {
        "risk_level": overall,
        "alerts": len(signals),
        "breakdown": {
            "high": high,
            "medium": medium,
            "low": low
        },
        "privacy_note": "Only risk summaries are shown. Message content is not stored."
    }