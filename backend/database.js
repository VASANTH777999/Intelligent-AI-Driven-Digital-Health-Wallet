const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'health_wallet.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {

      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS health_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          report_type TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          report_date DATE NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS vitals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          vital_type TEXT NOT NULL,
          value REAL NOT NULL,
          unit TEXT NOT NULL,
          recorded_at DATETIME NOT NULL,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS report_vitals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL,
          vital_type TEXT NOT NULL,
          value REAL NOT NULL,
          unit TEXT NOT NULL,
          FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS shared_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER NOT NULL,
          shared_with_id INTEGER NOT NULL,
          report_id INTEGER NOT NULL,
          access_level TEXT DEFAULT 'read',
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          report_id INTEGER,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE SET NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS analyses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          summary TEXT,
          findings TEXT,
          condition TEXT,
          risks TEXT,
          recommendations TEXT,
          precautions TEXT,
          consult_doctor TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initDatabase };
