import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'dev.db');
mkdirSync(__dirname, { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(`
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS barber_availability;
DROP TABLE IF EXISTS business_info;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS barbers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CLIENT',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE barbers (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT NOT NULL,
  instagram TEXT NOT NULL,
  reference TEXT NOT NULL,
  photoUrl TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE services (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  durationMin INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE barber_availability (
  id TEXT NOT NULL PRIMARY KEY,
  barberId TEXT NOT NULL,
  dayOfWeek INTEGER NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  slotMinutes INTEGER NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT barber_availability_barberId_fkey FOREIGN KEY (barberId) REFERENCES barbers (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE appointments (
  id TEXT NOT NULL PRIMARY KEY,
  clientId TEXT NOT NULL,
  barberId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  date DATETIME NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  anyBarber BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT appointments_clientId_fkey FOREIGN KEY (clientId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT appointments_barberId_fkey FOREIGN KEY (barberId) REFERENCES barbers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT appointments_serviceId_fkey FOREIGN KEY (serviceId) REFERENCES services (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE business_info (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  instagram TEXT NOT NULL,
  mapUrl TEXT,
  openingText TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

CREATE UNIQUE INDEX barber_availability_barberId_dayOfWeek_key ON barber_availability(barberId, dayOfWeek);
CREATE UNIQUE INDEX appointments_barberId_date_time_key ON appointments(barberId, date, time);
CREATE INDEX appointments_date_idx ON appointments(date);
CREATE INDEX appointments_status_idx ON appointments(status);
`);

db.close();
console.log(`SQLite listo en ${dbPath}`);
