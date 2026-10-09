import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "inventory.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    sku TEXT,
    unit TEXT NOT NULL DEFAULT 'unidad',
    quantity INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supply_id INTEGER NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'salida')),
    quantity INTEGER NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jotform_submission_id TEXT UNIQUE NOT NULL,
    area TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    supply_id INTEGER REFERENCES supplies(id) ON DELETE SET NULL,
    supply_name_raw TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'entregada', 'rechazada')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT
  );
`);

const existingColumns = db.prepare("PRAGMA table_info(supplies)").all().map((c) => c.name);
const newColumns = {
  model_code: "TEXT",
  brand: "TEXT",
  compatibility: "TEXT",
  notes: "TEXT",
};
for (const [column, type] of Object.entries(newColumns)) {
  if (!existingColumns.includes(column)) {
    db.exec(`ALTER TABLE supplies ADD COLUMN ${column} ${type}`);
  }
}
