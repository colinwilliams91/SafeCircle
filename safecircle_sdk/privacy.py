from .models import AnalysisResult, PrivacySignal
from .utils import new_event_id, utc_now_iso

def build_privacy_signal(result: AnalysisResult) -> PrivacySignal:
    if result.label_name == "unsafe":
    if result.unsafe_score is not None and result.unsafe_score > 0.8:
        severity = "high"
    else:
        severity = "medium"
        category = result.reasons[0] if result.reasons else "unsafe_pattern"
    else:
        severity = "low"
        category = "safe"
    return PrivacySignal(
        event_id=new_event_id(),
        category=category,
        severity=severity,
        unsafe_score=result.unsafe_score,
        timestamp=utc_now_iso(),
    )