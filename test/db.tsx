import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const openDb = async () => {
  const db = await open({
    filename: 'glucose_data.db',
    driver: sqlite3.Database,
  });
  return db;
};

export const initDb = async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS glucose_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      glucose_level REAL NOT NULL,
      device_id TEXT NOT NULL
    );
  `);
  console.log('Table created successfully');
};

export const insertData = async (timestamp: string, glucoseLevel: number, deviceId: string) => {
  const db = await openDb();
  await db.run(
    `INSERT INTO glucose_data (timestamp, glucose_level, device_id) VALUES (?, ?, ?);`,
    timestamp,
    glucoseLevel,
    deviceId
  );
  console.log('Data inserted successfully');
};

export const fetchAllData = async () => {
  const db = await openDb();
  const rows = await db.all(`SELECT * FROM glucose_data;`);
  console.log('Fetched data:', rows);
  return rows;
};
