# SafeCircle — Privacy-First Youth Safety System

SafeCircle is a prototype demonstrating how digital platforms can provide youth safety protections without invasive monitoring.

---

## Hackathon Submission

This project was developed as a submission for the **FOSSASIA Hackathon 2026**, sponsored by ExpressVPN.

### Challenge

Digital platforms increasingly serve younger generations of users, yet many existing safety mechanisms rely on centralized monitoring or invasive data collection. The challenge is to design systems where safety and responsible data practices are embedded by design while preserving privacy and user autonomy.

### Our Approach

SafeCircle demonstrates a privacy-first youth safety architecture that combines:

- AI safety analysis
- Federated learning with Flower
- Privacy-preserving safety signals
- Consent-based reporting
- VPN-protected network architecture

## Submission Summary

**SafeCircle** is a privacy-first youth safety prototype built for the **FOSSASIA Hackathon 2026 (ExpressVPN Challenge)**.

The project demonstrates how digital platforms can implement safety features without relying on centralized monitoring or invasive data collection. SafeCircle combines **AI-based message analysis**, **federated learning with the Flower framework**, and **privacy-preserving safety signals** to detect potentially harmful interactions while keeping user conversations private.

The system also illustrates how **secure network transport (VPN architecture)** can protect communication between clients and servers, minimizing metadata exposure. Instead of storing full message histories, the platform generates minimal safety indicators that support **consent-based reporting and privacy-aware guardian guidance**.

Together, these components showcase a practical architecture for **“safety without surveillance”** in modern digital platforms used by younger audiences.

## Federated Learning Demo

SafeCircle uses the **Flower Federated Learning Framework** to simulate decentralized training.

Instead of sending raw user conversations to a central server, each client trains the safety model locally and only shares model updates.

This approach improves the shared model while preserving user privacy.

Flower framework:
https://flower.ai/

---

# Setup
SafeCircle is a prototype demonstrating how digital platforms can provide **youth safety protections without invasive monitoring**.

The system combines:

- AI safety analysis
- federated learning
- privacy-preserving signals
- optional VPN-protected network architecture

The goal is to show how platforms can **detect harmful patterns while minimizing exposure of private conversations**.

---

# Setup

## Requirements

- Python **3.13+** (recommended: Python 3.13.3)
- pip

## Create the environment

```bash
python3 -m venv venv && source venv/bin/activate
pip3 install -r requirements.txt
mkdir -p data/client1 data/client2 data/client3 models
python3 make_data.py
python3 train_data.py
```

Start the backend API:

```bash
uvicorn api:app --reload --port 8000
```

---

# Demo Architecture

SafeCircle includes **three different demo layers**, each demonstrating a different part of the system.

---

# 1. UI Demo (Product Demo)

## Components

- `ui.html`
- `api.py`
- `models/global_model.joblib`

## Scenario

1. The judge opens the browser interface.
2. A chat message is typed or pre-filled.
3. The **Analyze Safety** button is clicked.
4. The backend API evaluates the message using the trained model.
5. The UI displays whether the message is **safe or unsafe** along with a risk score.

This represents the **product experience** of SafeCircle.

## Commands for this demo

Make sure the API is running:

```bash
uvicorn api:app --reload --port 8000
```

Serve the frontend:

```bash
python3 -m http.server 5500
```

Open the browser:

```
http://127.0.0.1:5500/ui.html
```

---

# 2. Flower Clients Demo (Federated Learning)

## Components

- `server.py`
- `client.py`
- `data/client1/train.csv`
- `data/client2/train.csv`
- `data/client3/train.csv`

## Scenario

1. Multiple terminals run Flower clients.
2. Each client trains a local model using its own dataset.
3. Clients send **model updates only** to the federated server.
4. The server aggregates updates using the **FedAvg algorithm**.
5. The shared model improves without centralizing user conversations.

This demonstrates the **privacy-preserving training architecture**.

## Commands for this demo

Start the federated server:

```bash
python3 server.py
```

Run each client in separate terminals:

```bash
python3 client.py --data data/client1/train.csv
```

```bash
python3 client.py --data data/client2/train.csv
```

```bash
python3 client.py --data data/client3/train.csv
```

---

# 3. SDK Demo (demo_app.py)

## Components

- `demo_app.py`
- `safecircle_sdk/`

## Scenario

This demonstrates how developers could integrate SafeCircle into their own applications.

1. A message is analyzed using the SDK.
2. The SDK calls the safety API.
3. Results are converted into:
   - privacy signals
   - guardian summaries
   - anonymous safety reports.

## Command

Make sure the API is running:

```bash
uvicorn api:app --reload --port 8000
```

Then run:

```bash
python3 demo_app.py
```

---

# Full Demo Run Order

To run the **complete demo environment**, execute:

```bash
python3 -m venv venv && source venv/bin/activate
pip3 install -r requirements.txt
mkdir -p data/client1 data/client2 data/client3 models
python3 make_data.py
python3 train_data.py
uvicorn api:app --reload --port 8000
python3 server.py
python3 client.py --data data/client1/train.csv
python3 client.py --data data/client2/train.csv
python3 client.py --data data/client3/train.csv
```

Optional frontend demo:

```bash
python3 -m http.server 5500
```

Optional SDK demo:

```bash
python3 demo_app.py
```

---

# Key Idea

SafeCircle demonstrates how safety systems can be designed with **privacy by default**:

- Local analysis reduces central data collection
- Federated learning improves models without sharing raw conversations
- Minimal safety signals replace invasive monitoring
- Encrypted network transport (VPN) protects metadata

The result is a **privacy-first safety architecture** for digital platforms used by younger audiences.