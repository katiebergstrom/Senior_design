const sqlite3 = require('sqlite3').verbose();

// Create a table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "users" created successfully.');
    }
  });

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "users" created successfully.');
    }
  });

  const insert = `INSERT INTO users (name, day) VALUES (?, ?)`;
  db.run(insert, ["Mark", "02/04/25"]);
  db.run(insert, ["Andrew", "02/04/25"]);

  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error('Error querying data:', err.message);
    } else {
      console.log('User data:', rows);
    }
  });
});
