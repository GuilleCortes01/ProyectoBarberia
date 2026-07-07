import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'dev.db'));
db.exec('DROP INDEX IF EXISTS appointments_barberId_date_time_key');
db.close();
console.log('Indice unico de reservas removido.');
