import uuid
import datetime


def report_anonymously(signal):
    """
    Simulate sending an anonymous safety report.
    No personal data is included.
    """

    report = {
        "report_id": str(uuid.uuid4()),
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "risk_level": signal.risk_level,
        "category": signal.category,
        "score": signal.score,
        "metadata": {
            "source": "safecircle_sdk",
            "privacy_mode": "minimal"
        }
    }

    # In a real system this would send to a backend
    # For the hackathon we just return the report

    return {
        "status": "submitted",
        "report": report
    }


def submit_anonymous_report(signal):
    """Deprecated: Use report_anonymously instead."""
    return report_anonymously(signal)
