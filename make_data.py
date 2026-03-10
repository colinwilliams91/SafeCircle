os.makedirs("data/client1", exist_ok=True)
os.makedirs("data/client2", exist_ok=True)
os.makedirs("data/client3", exist_ok=True)

data = [
    ("hello how are you",0),
    ("see you tomorrow",0),
    ("you are stupid",1),
    ("nobody likes you",1),
    ("dont tell your parents",1),
    ("meet me after school",1),
    ("thank you for helping me",0),
]

df = pd.DataFrame(data, columns=["text","label"])

df.sample(frac=0.33).to_csv("data/client1/train.csv",index=False)
df.sample(frac=0.33).to_csv("data/client2/train.csv",index=False)
df.sample(frac=0.33).to_csv("data/client3/train.csv",index=False)