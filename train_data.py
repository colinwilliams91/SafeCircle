import os
import glob
import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier

os.makedirs("models", exist_ok=True)

csv_files = glob.glob("data/client*/train.csv")
dfs = [pd.read_csv(f) for f in csv_files]
df = pd.concat(dfs, ignore_index=True)

if df["label"].nunique() < 2:
    raise ValueError(f"Need at least 2 classes, found: {df['label'].unique()}")

model = Pipeline([
    (
        "vec",
        HashingVectorizer(
            n_features=256,
            alternate_sign=False,
            norm="l2"
        ),
    ),
    (
        "clf",
        SGDClassifier(
            loss="log_loss",
            random_state=42,
            max_iter=1000,
            tol=1e-3,
        ),
    ),
])

model.fit(df["text"].astype(str), df["label"].astype(int))

joblib.dump(model, "models/global_model.joblib")
print("Model saved to models/global_model.joblib")