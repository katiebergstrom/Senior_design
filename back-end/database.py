import sqlite3
from datetime import datetime, timedelta

def init_db():
    conn = sqlite3.connect('glucose_data.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS glucose_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        glucose_level REAL,
        device_id TEXT
    )
    ''')
    conn.commit()
    conn.close()

def store_data(timestamp, glucose_level, device_id):
    conn = sqlite3.connect('glucose_data.db')
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO glucose_data (timestamp, glucose_level, device_id)
    VALUES (?, ?, ?)
    ''', (timestamp, glucose_level, device_id))
    conn.commit()
    conn.close()

def get_data(minutes=3):
    conn = sqlite3.connect('glucose_data.db')
    cursor = conn.cursor()
    cutoff = datetime.now() - timedelta(minutes=minutes)
    cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('SELECT * FROM glucose_data WHERE timestamp >= ?', (cutoff_str,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def find_gap():
    conn = sqlite3.connect('glucose_data.db')
    cursor = conn.cursor()
    cursor.execute('SELECT timestamp FROM glucose_data ORDER BY timestamp')
    timestamps = [datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") for row in cursor.fetchall()]
    conn.close()

    gaps = []
    for i in range(1, len(timestamps)):
        if (timestamps[i] - timestamps[i - 1]).total_seconds() > 180:  # Gap > 3 minutes
            gaps.append((timestamps[i - 1], timestamps[i]))
    return gaps
