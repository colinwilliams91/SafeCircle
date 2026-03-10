from dataclasses import dataclass
from typing import List, Optional


@dataclass
class AnalysisResult:
    label: int
    label_name: str
    unsafe_score: Optional[float]
    reasons: List[str]


@dataclass
class PrivacySignal:
    risk_level: str
    category: str
    score: Optional[float]