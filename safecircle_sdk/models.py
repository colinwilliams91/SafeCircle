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
    event_id: str
    category: str
    severity: str
    unsafe_score: Optional[float]
    timestamp: str