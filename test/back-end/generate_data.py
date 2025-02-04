import numpy as np
import pandas as pd
import datetime
import random
import sqlite3

def simulate_glucose_data(start_time, end_time, frequency_in_minutes):
    timestamps = pd.date_range(start=start_time, end=end_time, freq=f'{frequency_in_minutes}T')
    glucose_levels = []

    for timestamp in timestamps:
        # simulate glucose levels using a sine function and random noise
        time_in_hours = (timestamp - timestamps[0]).total_seconds() / 3600
        base_glucose = 80 + 20 * np.sin(2 * np.pi * time_in_hours / 24)
        noise = random.uniform(-10, 10)
        glucose_level = base_glucose + noise
        glucose_levels.append((timestamp.strftime('%Y-%m-%d %H:%M:%S'), round(glucose_level, 2)))

    return glucose_levels

if __name__ == '__main__':
    start_time = datetime.datetime.now() - datetime.timedelta(days=1)
    end_time = datetime.datetime.now()
    frequency_in_minutes = 3  # glucose comes in every 3 min

    # generate simulated glucose data
    glucose_data = simulate_glucose_data(start_time, end_time, frequency_in_minutes)

    conn = sqlite3.connect('glucose_data.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS glucose_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME NOT NULL,
            glucose_level REAL NOT NULL
        )
    ''')
    conn.commit()

    cursor.executemany('''
        INSERT INTO glucose_readings (timestamp, glucose_level)
        VALUES (?, ?)
    ''', glucose_data)
    conn.commit()
    conn.close()