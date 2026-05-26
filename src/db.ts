import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import type { CapacitorSQLitePlugin } from '@capacitor-community/sqlite';
import Database from '@tauri-apps/plugin-sql';
import { defaultConfig } from './types';
import type { Bill, BillItem, ConfigData } from './types';

// We abstract the platform differences here.
let tauriDb: Database | null = null;
let capDb: any = null;
let isMobile = false;
let isTauri = false;
let isWeb = false;

// Initialize the database connection
export async function initDB() {
  isMobile = Capacitor.isNativePlatform();
  isTauri = !!(window as any).__TAURI_INTERNALS__;
  isWeb = !isMobile && !isTauri;

  if (isMobile) {
    const sqlite = new SQLiteConnection(CapacitorSQLite as CapacitorSQLitePlugin);
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection("biller_db", false)).result;
    if (ret.result && isConn) {
      capDb = await sqlite.retrieveConnection("biller_db", false);
    } else {
      capDb = await sqlite.createConnection("biller_db", false, "no-encryption", 1, false);
    }
    await capDb.open();
  } else if (isTauri) {
    // Tauri Desktop
    tauriDb = await Database.load("sqlite:biller.db");
  } else {
    // Web fallback for development
    if (!localStorage.getItem('biller_bills')) {
      localStorage.setItem('biller_bills', JSON.stringify([]));
    }
    if (!localStorage.getItem('biller_items')) {
      localStorage.setItem('biller_items', JSON.stringify([]));
    }
    if (!localStorage.getItem('biller_config')) {
      localStorage.setItem('biller_config', JSON.stringify({}));
    }
  }

  await createTables();
}

async function executeSql(sql: string, params: any[] = []) {
  if (isWeb) return;
  if (isMobile) {
    await capDb.run(sql, params);
  } else if (isTauri) {
    await tauriDb!.execute(sql, params);
  }
}

async function querySql(sql: string, params: any[] = []): Promise<any[]> {
  if (isWeb) return [];
  if (isMobile) {
    const res = await capDb.query(sql, params);
    return res.values || [];
  } else if (isTauri) {
    return await tauriDb!.select(sql, params) as any[];
  }
  return [];
}

async function createTables() {
  const configTable = `
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `;
  const billsTable = `
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      customer_name TEXT,
      customer_group TEXT,
      advance REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      created_at TEXT
    );
  `;
  const billItemsTable = `
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      qty REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      luggage REAL DEFAULT 0,
      p_amount REAL DEFAULT 0
    );
  `;

  await executeSql(configTable);
  await executeSql(billsTable);
  await executeSql(billItemsTable);

  // Seed default config
  const existingConfig = await getConfig();
  if (!existingConfig.shopName) {
    await saveConfig(defaultConfig);
  }
}

export async function getConfig(): Promise<Partial<ConfigData>> {
  if (isWeb) {
    const data = JSON.parse(localStorage.getItem('biller_config') || '{}');
    return data;
  }
  const rows = await querySql('SELECT key, value FROM config');
  const config: any = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  
  if (config.commissionPct) config.commissionPct = Number(config.commissionPct);
  if (config.cooliePerEntry) config.cooliePerEntry = Number(config.cooliePerEntry);
  
  return config;
}

export async function saveConfig(config: ConfigData) {
  if (isWeb) {
    localStorage.setItem('biller_config', JSON.stringify(config));
    return;
  }
  for (const [key, value] of Object.entries(config)) {
    if (isMobile) {
      await executeSql('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, String(value)]);
    } else if (isTauri) {
      // Tauri sql plugin uses specific syntax for replace, standard SQLite:
      await executeSql('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, String(value)]);
    }
  }
}

export async function createBill(bill: Bill, items: BillItem[]): Promise<number> {
  const createdAt = new Date().toISOString();
  
  if (isWeb) {
    const bills = JSON.parse(localStorage.getItem('biller_bills') || '[]');
    const billItems = JSON.parse(localStorage.getItem('biller_items') || '[]');
    const billId = Date.now(); // pseudo-id
    bills.push({ ...bill, id: billId, created_at: createdAt });
    for (const item of items) {
      billItems.push({ ...item, bill_id: billId, id: Date.now() + Math.random() });
    }
    localStorage.setItem('biller_bills', JSON.stringify(bills));
    localStorage.setItem('biller_items', JSON.stringify(billItems));
    return billId;
  }
  
  if (isMobile) {
    const res = await capDb.run(
      'INSERT INTO bills (date, customer_name, customer_group, advance, paid, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [bill.date, bill.customer_name, bill.customer_group, bill.advance, bill.paid, createdAt]
    );
    const billId = res.changes.lastId;
    for (const item of items) {
      await capDb.run(
        'INSERT INTO bill_items (bill_id, item_name, qty, price, total, luggage, p_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [billId, item.item_name, item.qty, item.price, item.total, item.luggage, item.p_amount]
      );
    }
    return billId;
  } else if (isTauri) {
    const res = await tauriDb!.execute(
      'INSERT INTO bills (date, customer_name, customer_group, advance, paid, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [bill.date, bill.customer_name, bill.customer_group, bill.advance, bill.paid, createdAt]
    );
    const billId = res.lastInsertId;
    for (const item of items) {
      await tauriDb!.execute(
        'INSERT INTO bill_items (bill_id, item_name, qty, price, total, luggage, p_amount) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [billId, item.item_name, item.qty, item.price, item.total, item.luggage, item.p_amount]
      );
    }
    return billId as number;
  }
  return 0;
}

export async function getBills(): Promise<Bill[]> {
  if (isWeb) {
    const bills = JSON.parse(localStorage.getItem('biller_bills') || '[]');
    return bills.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  const rows = await querySql('SELECT * FROM bills ORDER BY date DESC, id DESC');
  return rows;
}

export async function getBillItems(billId: number): Promise<BillItem[]> {
  if (isWeb) {
    const items = JSON.parse(localStorage.getItem('biller_items') || '[]');
    return items.filter((item: any) => item.bill_id === billId);
  }
  const rows = await querySql('SELECT * FROM bill_items WHERE bill_id = $1', [billId]);
  return rows;
}

export async function updateBillPaid(billId: number, paid: number) {
  if (isWeb) {
    const bills = JSON.parse(localStorage.getItem('biller_bills') || '[]');
    const bill = bills.find((b: any) => b.id === billId);
    if (bill) bill.paid = paid;
    localStorage.setItem('biller_bills', JSON.stringify(bills));
    return;
  }
  if (isMobile) {
    await executeSql('UPDATE bills SET paid = ? WHERE id = ?', [paid, billId]);
  } else if (isTauri) {
    await executeSql('UPDATE bills SET paid = $1 WHERE id = $2', [paid, billId]);
  }
}

export async function deleteBill(billId: number) {
  if (isWeb) {
    let bills = JSON.parse(localStorage.getItem('biller_bills') || '[]');
    bills = bills.filter((b: any) => b.id !== billId);
    localStorage.setItem('biller_bills', JSON.stringify(bills));
    return;
  }
  if (isMobile) {
    await executeSql('DELETE FROM bills WHERE id = ?', [billId]);
  } else if (isTauri) {
    await executeSql('DELETE FROM bills WHERE id = $1', [billId]);
  }
}
