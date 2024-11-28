from database import store_data
from datetime import datetime
import random
import time

def generate_fake_data():
    for _ in range(10):  # Simulate 10 records
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        glucose_level = round(random.uniform(70, 180), 2)  # Random glucose level
        store_data(timestamp, glucose_level, "CGM123")
        print(f"Inserted: {timestamp}, {glucose_level}")
        time.sleep(5)  # Simulate data every 3 minutes

if __name__ == "__main__":
    generate_fake_data()

