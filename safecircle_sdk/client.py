import requests

from .models import AnalysisResult
from .privacy import build_privacy_signal
from .guardian import build_guardian_summary
from .reporting import submit_anonymous_report


class SafeCircleClient:
    def __init__(self, api_url: str = "http://127.0.0.1:8000/predict"):
        self.api_url = api_url

    def _infer_reasons(self, text: str, label_name: str) -> list[str]:
        lower = text.lower()
        reasons = []

        if "don't tell" in lower or "dont tell" in lower:
            reasons.append("secrecy_request")
        if "meet me" in lower:
            reasons.append("isolated_meetup")
        if "worthless" in lower or "stupid" in lower or "nobody likes you" in lower:
            reasons.append("harassment_language")
        if "alone" in lower:
            reasons.append("isolation_language")

        if not reasons and label_name == "unsafe":
            reasons.append("unsafe_pattern")
        if not reasons and label_name == "safe":
            reasons.append("safe")

        return reasons

    def analyze_text(self, text: str) -> AnalysisResult:
        resp = requests.post(self.api_url, json={"text": text}, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        label_name = data.get("label_name", "unknown")
        unsafe_score = data.get("unsafe_score", None)

        return AnalysisResult(
            label=data.get("label", 0),
            label_name=label_name,
            unsafe_score=unsafe_score,
            reasons=self._infer_reasons(text, label_name),
        )

    def create_privacy_signal(self, analysis: AnalysisResult):
        return build_privacy_signal(analysis)

    def guardian_view(self, signals):
        return build_guardian_summary(signals)

    def anonymous_report(self, signal):
        return submit_anonymous_report(signal)