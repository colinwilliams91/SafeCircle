import argparse
import joblib
import flwr as fl
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score


def load_data(csv_path: str):
    df = pd.read_csv(csv_path)
    return df["text"].tolist(), df["label"].tolist()


def build_model() -> Pipeline:
    return Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", SGDClassifier(loss="log_loss", random_state=42)),
        ]
    )


class SafeCircleClient(fl.client.NumPyClient):
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.x_train, self.y_train = load_data(data_path)
        self.model = build_model()

        # initialize shapes
        self.model.fit(self.x_train, self.y_train)

    def get_parameters(self, config):
        clf = self.model.named_steps["clf"]
        return [clf.coef_, clf.intercept_]

    def set_parameters(self, parameters):
        clf = self.model.named_steps["clf"]
        clf.coef_ = parameters[0]
        clf.intercept_ = parameters[1]
        clf.classes_ = self.model.named_steps["clf"].classes_

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.fit(self.x_train, self.y_train)

        clf = self.model.named_steps["clf"]
        return [clf.coef_, clf.intercept_], len(self.x_train), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        preds = self.model.predict(self.x_train)
        acc = accuracy_score(self.y_train, preds)
        loss = 1.0 - acc
        return float(loss), len(self.x_train), {"accuracy": float(acc)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, required=True, help="Path to train.csv")
    parser.add_argument("--server", type=str, default="127.0.0.1:8080")
    args = parser.parse_args()

    client = SafeCircleClient(args.data)
    fl.client.start_numpy_client(server_address=args.server, client=client)


if __name__ == "__main__":
    main()