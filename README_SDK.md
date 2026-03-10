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
