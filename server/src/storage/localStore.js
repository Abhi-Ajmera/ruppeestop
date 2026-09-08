import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LotStatus } from '../constants/enums.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

const INITIAL_DEMO_DATA = {
  buyLots: [
    {
      id: 'lot-1',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2024-10-15',
      initialUnits: 100,
      remainingUnits: 100,
      pricePerUnit: 52.40,
      investedAmount: 5240,
      status: LotStatus.ACTIVE,
      createdAt: '2024-10-15T10:00:00.000Z'
    },
    {
      id: 'lot-2',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2025-03-20',
      initialUnits: 80,
      remainingUnits: 80,
      pricePerUnit: 56.10,
      investedAmount: 4488,
      status: LotStatus.ACTIVE,
      createdAt: '2025-03-20T10:00:00.000Z'
    },
    {
      id: 'lot-3',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2025-11-10',
      initialUnits: 50,
      remainingUnits: 50,
      pricePerUnit: 61.80,
      investedAmount: 3090,
      status: LotStatus.ACTIVE,
      createdAt: '2025-11-10T10:00:00.000Z'
    },
    {
      id: 'lot-4',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2026-04-12',
      initialUnits: 120,
      remainingUnits: 120,
      pricePerUnit: 68.25,
      investedAmount: 8190,
      status: LotStatus.ACTIVE,
      createdAt: '2026-04-12T10:00:00.000Z'
    }
  ],
  sellTransactions: []
};

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DEMO_DATA, null, 2), 'utf-8');
  }
}

export function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      buyLots: Array.isArray(parsed.buyLots) ? parsed.buyLots : [],
      sellTransactions: Array.isArray(parsed.sellTransactions) ? parsed.sellTransactions : []
    };
  } catch (err) {
    console.error('Error reading DB, re-initializing fallback:', err);
    return INITIAL_DEMO_DATA;
  }
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function resetDb() {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DEMO_DATA, null, 2), 'utf-8');
  return INITIAL_DEMO_DATA;
}

export function clearDb() {
  const empty = { buyLots: [], sellTransactions: [] };
  writeDb(empty);
  return empty;
}
