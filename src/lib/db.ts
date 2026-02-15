import Database from 'better-sqlite3';
import { join } from 'path';

// Database path: use DB_PATH env var, or default to ./data/guests.db
const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'guests.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    dabei TEXT NOT NULL DEFAULT '',
    personen INTEGER NOT NULL DEFAULT 1,
    ernaehrung TEXT DEFAULT '',
    unvertraeglichkeiten TEXT DEFAULT '',
    nachricht TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`);

// Seed default tasks if table is empty
const taskCount = (db.prepare('SELECT COUNT(*) as c FROM tasks').get() as { c: number }).c;
if (taskCount === 0) {
  const seedTasks = db.prepare('INSERT INTO tasks (section, title, sort_order) VALUES (@section, @title, @sort_order)');
  const seed = db.transaction((tasks: { section: string; title: string; sort_order: number }[]) => {
    for (const t of tasks) seedTasks.run(t);
  });
  seed([
    // Vorab & Einladungen
    { section: 'Vorab & Einladungen', title: 'Gästeliste finalisieren', sort_order: 1 },
    { section: 'Vorab & Einladungen', title: 'Website-Link an alle Gäste versenden', sort_order: 2 },
    { section: 'Vorab & Einladungen', title: 'RSVP-Rücklauf verfolgen & nachhaken', sort_order: 3 },
    { section: 'Vorab & Einladungen', title: 'Erinnerung 2 Wochen vorher senden', sort_order: 4 },
    { section: 'Vorab & Einladungen', title: 'Finale Info-Mail (Treffpunkt, Uhrzeit, Ablauf)', sort_order: 5 },
    { section: 'Vorab & Einladungen', title: 'Unverträglichkeiten / Ernährungswünsche auswerten', sort_order: 6 },
    { section: 'Vorab & Einladungen', title: 'Detaillierten Tagesablauf erstellen', sort_order: 7 },
    { section: 'Vorab & Einladungen', title: 'Budget-Übersicht erstellen', sort_order: 8 },
    { section: 'Vorab & Einladungen', title: 'Regenplan / Schlechtwetter-Alternative', sort_order: 9 },
    { section: 'Vorab & Einladungen', title: 'Spotify Playlists erstellen & teilen', sort_order: 10 },

    // 1 — Strandperle
    { section: '① Strandperle', title: 'Reservierung / Absprache Treffpunkt', sort_order: 1 },
    { section: '① Strandperle', title: 'Anfahrt & Parkplatz-Infos für Gäste', sort_order: 2 },
    { section: '① Strandperle', title: 'Snacks / Drinks organisieren', sort_order: 3 },
    { section: '① Strandperle', title: 'Bluetooth-Speaker mitnehmen', sort_order: 4 },
    { section: '① Strandperle', title: 'Begrüßung & Ablauf kurz erklären', sort_order: 5 },

    // 2 — Spaziergang Elbstrand
    { section: '② Spaziergang Elbstrand', title: 'Route festlegen (Strandperle → Museumshafen)', sort_order: 1 },
    { section: '② Spaziergang Elbstrand', title: 'Gehzeit einplanen (~20 Min)', sort_order: 2 },
    { section: '② Spaziergang Elbstrand', title: 'Trinkpause / Getränke für unterwegs', sort_order: 3 },

    // 3 — Barkasse
    { section: '③ Barkasse', title: 'Barkasse buchen (Route, Dauer, Kapazität)', sort_order: 1 },
    { section: '③ Barkasse', title: 'Abfahrtszeit & Anlegestelle bestätigen', sort_order: 2 },
    { section: '③ Barkasse', title: 'Getränke für Barkasse organisieren', sort_order: 3 },
    { section: '③ Barkasse', title: 'Musik / Speaker an Bord', sort_order: 4 },
    { section: '③ Barkasse', title: 'Versicherung / Haftung klären', sort_order: 5 },
    { section: '③ Barkasse', title: 'Rede / Toast auf dem Wasser', sort_order: 6 },

    // 4 — Landungsbrücken → Portugiesenviertel
    { section: '④ Landungsbrücken', title: 'Anlegestelle → Fußweg zum Portugiesenviertel', sort_order: 1 },
    { section: '④ Landungsbrücken', title: 'Pufferzeit einplanen', sort_order: 2 },
    { section: '④ Landungsbrücken', title: 'Zwischenstopp / Drink an den Landungsbrücken', sort_order: 3 },

    // 5 — La Cocina
    { section: '⑤ La Cocina', title: 'Reservierung (Personenzahl, Uhrzeit)', sort_order: 1 },
    { section: '⑤ La Cocina', title: 'Menü / Buffet abstimmen', sort_order: 2 },
    { section: '⑤ La Cocina', title: 'Getränke planen (Wein, Bier, Softdrinks)', sort_order: 3 },
    { section: '⑤ La Cocina', title: 'Geburtstagskuchen / Torte bestellen', sort_order: 4 },
    { section: '⑤ La Cocina', title: 'Tischdeko / Blumen', sort_order: 5 },
    { section: '⑤ La Cocina', title: 'Tischordnung / Namensschilder', sort_order: 6 },
    { section: '⑤ La Cocina', title: 'Playlist-Übergänge für Abendprogramm', sort_order: 7 },
    { section: '⑤ La Cocina', title: 'Foto-Ecke / Polaroid-Kamera', sort_order: 8 },
    { section: '⑤ La Cocina', title: 'Gästebuch oder Nachrichtenkarten', sort_order: 9 },

    // Nachher & Logistik
    { section: 'Nachher & Logistik', title: 'Taxinummern / Heimfahrt-Optionen bereitstellen', sort_order: 1 },
    { section: 'Nachher & Logistik', title: 'Fotograf / Foto-Aufgabe an jemanden vergeben', sort_order: 2 },
    { section: 'Nachher & Logistik', title: 'Fotos sammeln & teilen nach dem Event', sort_order: 3 },
    { section: 'Nachher & Logistik', title: 'Geschenke-Wunschliste (falls gewünscht)', sort_order: 4 },
    { section: 'Nachher & Logistik', title: 'Danke-Nachricht an Gäste', sort_order: 5 },
  ]);
}

// Prepared statements
export const insertGuest = db.prepare(`
  INSERT INTO guests (name, email, dabei, personen, ernaehrung, unvertraeglichkeiten, nachricht)
  VALUES (@name, @email, @dabei, @personen, @ernaehrung, @unvertraeglichkeiten, @nachricht)
`);

export const getAllGuests = db.prepare(`
  SELECT * FROM guests ORDER BY created_at DESC
`);

export const getGuestById = db.prepare(`
  SELECT * FROM guests WHERE id = ?
`);

export const updateGuest = db.prepare(`
  UPDATE guests SET
    name = @name,
    email = @email,
    dabei = @dabei,
    personen = @personen,
    ernaehrung = @ernaehrung,
    unvertraeglichkeiten = @unvertraeglichkeiten,
    nachricht = @nachricht,
    updated_at = datetime('now', 'localtime')
  WHERE id = @id
`);

export const deleteGuest = db.prepare(`
  DELETE FROM guests WHERE id = ?
`);

export const getStats = () => {
  const total = db.prepare(`SELECT COUNT(*) as count FROM guests`).get() as { count: number };
  const dabei = db.prepare(`SELECT COUNT(*) as count FROM guests WHERE dabei = 'Ja, bin dabei'`).get() as { count: number };
  const unsicher = db.prepare(`SELECT COUNT(*) as count FROM guests WHERE dabei = 'Noch unsicher'`).get() as { count: number };
  const absage = db.prepare(`SELECT COUNT(*) as count FROM guests WHERE dabei = 'Schaffe es leider nicht'`).get() as { count: number };
  const personenGesamt = db.prepare(`SELECT COALESCE(SUM(personen), 0) as total FROM guests WHERE dabei = 'Ja, bin dabei'`).get() as { total: number };

  return {
    total: total.count,
    dabei: dabei.count,
    unsicher: unsicher.count,
    absage: absage.count,
    personenGesamt: personenGesamt.total,
  };
};

// Session management
export const createSession = db.prepare(`
  INSERT INTO sessions (token) VALUES (?)
`);

export const getSession = db.prepare(`
  SELECT * FROM sessions WHERE token = ?
`);

export const deleteSession = db.prepare(`
  DELETE FROM sessions WHERE token = ?
`);

// Clean old sessions (older than 24h)
export const cleanSessions = db.prepare(`
  DELETE FROM sessions WHERE created_at < datetime('now', '-24 hours')
`);

// Task management
export const getAllTasks = db.prepare(`
  SELECT * FROM tasks ORDER BY section, sort_order
`);

export const toggleTask = db.prepare(`
  UPDATE tasks SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END WHERE id = ?
`);

export const addTask = db.prepare(`
  INSERT INTO tasks (section, title, sort_order) VALUES (@section, @title, @sort_order)
`);

export const deleteTask = db.prepare(`
  DELETE FROM tasks WHERE id = ?
`);

export const getTaskStats = () => {
  const total = (db.prepare('SELECT COUNT(*) as c FROM tasks').get() as { c: number }).c;
  const done = (db.prepare('SELECT COUNT(*) as c FROM tasks WHERE done = 1').get() as { c: number }).c;
  return { total, done };
};

export default db;
