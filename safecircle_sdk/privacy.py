from .models import PrivacySignal


def build_privacy_signal(result):
    """
    Convert model analysis into a minimal privacy-safe signal.
    """

    risk_level = "low"
    category = "safe"

    if result.label_name == "unsafe":
        if result.reasons and len(result.reasons) > 0:
            category = result.reasons[0]
        else:
            category = "unsafe_pattern"

        if result.unsafe_score is not None and result.unsafe_score > 0.8:
            risk_level = "high"
        elif result.unsafe_score is not None and result.unsafe_score > 0.5:
            risk_level = "medium"
        else:
            risk_level = "low"

    signal = PrivacySignal(
        risk_level=risk_level,
        category=category,
        score=result.unsafe_score,
    )

    return signal