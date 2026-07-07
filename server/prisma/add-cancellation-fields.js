import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'dev.db'));
const columns = db.prepare('PRAGMA table_info(appointments)').all().map((column) => column.name);
if (!columns.includes('cancelledBy')) db.exec('ALTER TABLE appointments ADD COLUMN cancelledBy TEXT');
if (!columns.includes('hiddenFromClient')) db.exec('ALTER TABLE appointments ADD COLUMN hiddenFromClient BOOLEAN NOT NULL DEFAULT false');
db.close();
console.log('Campos de cancelacion listos.');
