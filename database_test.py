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

# fake data
for _ in range(10):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    glucose_level = round(random.uniform(70, 180), 2)  # random glucose level between 70 and 180
    device_id = "CGM123" # this would be an example of a device ID like the real board

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

two_minutes_ago = datetime.now() - timedelta(minutes=2)
two_minutes_ago_str = two_minutes_ago.strftime("%Y-%m-%d %H:%M:%S")

cursor.execute('''
SELECT * FROM glucose_data
WHERE timestamp >= ?
''', (two_minutes_ago_str,))

recent_rows = cursor.fetchall()
print("\nData from the last 2 minutes:")
for row in recent_rows:
    print(row)


conn.close()


