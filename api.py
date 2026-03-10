from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import math

app = FastAPI()

# Allow frontend running on another local port/file server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # hackathon demo only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

model = joblib.load("models/global_model.joblib")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: TextRequest):
    text = [req.text]

    pred = int(model.predict(text)[0])
    clf = model.named_steps["clf"]

    if hasattr(clf, "predict_proba"):
        unsafe_score = float(model.predict_proba(text)[0][1])
    else:
        score = float(model.decision_function(text)[0])
        unsafe_score = 1.0 / (1.0 + math.exp(-score))

    return {
        "label": pred,
        "label_name": "unsafe" if pred == 1 else "safe",
        "unsafe_score": unsafe_score,
    }