import os
import pandas as pd

os.makedirs("data/client1", exist_ok=True)
os.makedirs("data/client2", exist_ok=True)
os.makedirs("data/client3", exist_ok=True)

safe_samples = [
    ("hello how are you", 0),
    ("see you tomorrow", 0),
    ("thank you for helping me", 0),
    ("let's study together", 0),
    ("have a great day", 0),
    ("good job on your homework", 0),
]

unsafe_samples = [
    ("you are stupid", 1),
    ("nobody likes you", 1),
    ("dont tell your parents", 1),
    ("meet me after school", 1),
    ("you are worthless", 1),
    ("come alone and dont tell anyone", 1),
]

client1 = safe_samples[:2] + unsafe_samples[:2]
client2 = safe_samples[2:4] + unsafe_samples[2:4]
client3 = safe_samples[4:6] + unsafe_samples[4:6]

pd.DataFrame(client1, columns=["text", "label"]).to_csv("data/client1/train.csv", index=False)
pd.DataFrame(client2, columns=["text", "label"]).to_csv("data/client2/train.csv", index=False)
pd.DataFrame(client3, columns=["text", "label"]).to_csv("data/client3/train.csv", index=False)

print("Created client datasets with both safe and unsafe classes.")