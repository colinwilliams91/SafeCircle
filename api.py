from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

class TextRequest(BaseModel):
    text: str

model = joblib.load("models/global_model.joblib")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: TextRequest):
    text = [req.text]

    proba = model.predict_proba(text)[0][1]
    label = 1 if proba > 0.5 else 0

    return {
        "label": label,
        "label_name": "unsafe" if label else "safe",
        "unsafe_score": float(proba)
    }