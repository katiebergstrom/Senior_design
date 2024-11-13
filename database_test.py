import sqlite3
import random
from datetime import datetime, timedelta
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

def insert_data(cursor, timestamp, glucose_level, device_id):
    cursor.execute('''
    INSERT INTO glucose_data (timestamp, glucose_level, device_id)
    VALUES (?, ?, ?)
    ''', (timestamp, glucose_level, device_id))

def get_recent_data(cursor, minutes=2):
    recent_time = datetime.now() - timedelta(minutes=minutes)
    recent_time_str = recent_time.strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute('''
    SELECT * FROM glucose_data
    WHERE timestamp >= ?
    ''', (recent_time_str,))
    
    return cursor.fetchall()

def get_all_data(cursor):
    cursor.execute("SELECT * FROM glucose_data")
    return cursor.fetchall()

conn.commit()

# inserting data example (this is only 1 row at a time)
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
glucose_level = round(random.uniform(70, 180), 2)
device_id = "CGM123"
insert_data(cursor, timestamp, glucose_level, device_id)
conn.commit()

# fetching recent data (example: last 2 minutes)
print("\nData from the last 2 minutes:")
recent_rows = get_recent_data(cursor, minutes=2)
for row in recent_rows:
    print(row)

# fetch recent data (example: last 2 hours)
print("\nData from the last 2 hours:")
recent_rows = get_recent_data(cursor, minutes=120)
for row in recent_rows:
    print(row)

# fetching all of the data in the database
print("\nAll data in the database:")
all_data = get_all_data(cursor)
for row in all_data:
    print(row)


conn.close()


