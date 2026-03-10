import uuid
from datetime import datetime, timezone

def new_event_id() -> str:
    return str(uuid.uuid4())
    
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()