import sqlite3
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

from datetime import datetime
import random

# Generate and insert fake data
for _ in range(10):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    glucose_level = round(random.uniform(70, 180), 2)  # Random glucose level
    device_id = "CGM123"  # Example device ID

    cursor.execute('''
    INSERT INTO glucose_data (timestamp, glucose_level, device_id)
    VALUES (?, ?, ?)
    ''', (timestamp, glucose_level, device_id))

conn.commit()

# cursor.execute("SELECT * FROM glucose_data")
# rows = cursor.fetchall()

# for row in rows:
#     print(row)

from datetime import timedelta

two_hours_ago = datetime.now() - timedelta(hours=2)
two_hours_ago_str = two_hours_ago.strftime("%Y-%m-%d %H:%M:%S")

cursor.execute('''
SELECT * FROM glucose_data
WHERE timestamp >= ?
''', (two_hours_ago_str,))

recent_rows = cursor.fetchall()
print("\nData from the last 2 hours:")
for row in recent_rows:
    print(row)


conn.close()


