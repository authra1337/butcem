import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('finance_app.db');
  }
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDB();

  // Yabancı anahtar kısıtlamalarını etkinleştir
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Gerekli tabloları oluştur
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id INTEGER PRIMARY KEY,
      currency TEXT DEFAULT '₺',
      theme TEXT DEFAULT 'midnight',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      shares REAL NOT NULL,
      purchase_price REAL NOT NULL,
      current_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'income' | 'expense'
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      fund_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE SET NULL
    );
  `);

  // Mevcut kullanıcılarda settings tablosuna theme kolonu ekle
  try {
    await db.execAsync('ALTER TABLE settings ADD COLUMN theme TEXT DEFAULT "midnight";');
  } catch (err) {
    // Kolon zaten varsa hata verecektir, görmezden gel
  }
}

// --- Kullanıcı (User) İşlemleri ---

export async function createUser(username, password) {
  const db = await getDB();
  const res = await db.runAsync(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    username,
    password
  );
  const userId = res.lastInsertRowId;
  
  // Kullanıcı için varsayılan para birimi ve tema ayarını oluştur
  await db.runAsync('INSERT OR IGNORE INTO settings (user_id, currency, theme) VALUES (?, ?, ?)', userId, '₺', 'midnight');

  // Varsayılan işlemleri ekle (Sadece ilk profil oluşturmada tek seferlik)
  const defaultTransactions = [
    { id: '1_' + userId, title: 'Maaş Ödemesi', amount: 45000, type: 'income', category: 'diger', date: '08.06.2026' },
    { id: '2_' + userId, title: 'Market Alışverişi', amount: 2450, type: 'expense', category: 'gida', date: '08.06.2026' },
    { id: '3_' + userId, title: 'Aylık Metro Kartı', amount: 480, type: 'expense', category: 'ulasim', date: '07.06.2026' },
    { id: '4_' + userId, title: 'Konser Bileti', amount: 1200, type: 'expense', category: 'eglence', date: '06.06.2026' },
    { id: '5_' + userId, title: 'Spor Ayakkabı', amount: 3200, type: 'expense', category: 'alisveris', date: '05.06.2026' },
  ];

  for (const tx of defaultTransactions) {
    await db.runAsync(
      'INSERT INTO transactions (id, user_id, title, amount, type, category, date, fund_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      tx.id,
      userId,
      tx.title,
      tx.amount,
      tx.type,
      tx.category,
      tx.date,
      null
    );
  }

  return { id: userId, username };
}

export async function authenticateUser(username, password) {
  const db = await getDB();
  const user = await db.getFirstAsync(
    'SELECT id, username FROM users WHERE username = ? AND password = ?',
    username,
    password
  );
  return user;
}

export async function getUserList() {
  const db = await getDB();
  return await db.getAllAsync('SELECT id, username FROM users');
}

// --- Ayarlar (Settings) İşlemleri ---

export async function getUserSettings(userId) {
  const db = await getDB();
  let settings = await db.getFirstAsync('SELECT currency, theme FROM settings WHERE user_id = ?', userId);
  if (!settings) {
    await db.runAsync('INSERT OR IGNORE INTO settings (user_id, currency, theme) VALUES (?, ?, ?)', userId, '₺', 'midnight');
    settings = { currency: '₺', theme: 'midnight' };
  } else if (!settings.theme) {
    settings.theme = 'midnight';
  }
  return settings;
}

export async function updateUserSettings(userId, currency) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE settings SET currency = ? WHERE user_id = ?',
    currency,
    userId
  );
}

export async function updateUserTheme(userId, theme) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE settings SET theme = ? WHERE user_id = ?',
    theme,
    userId
  );
}

// --- İşlem (Transaction) İşlemleri ---

export async function getTransactions(userId) {
  const db = await getDB();
  return await db.getAllAsync(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC',
    userId
  );
}

export async function addTransaction(userId, tx) {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO transactions (id, user_id, title, amount, type, category, date, fund_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    tx.id,
    userId,
    tx.title,
    tx.amount,
    tx.type,
    tx.category,
    tx.date,
    tx.fundId || null
  );
}

export async function deleteTransaction(userId, id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ? AND user_id = ?', id, userId);
}

export async function clearAllUserData(userId) {
  const db = await getDB();
  await db.runAsync('DELETE FROM transactions WHERE user_id = ?', userId);
  await db.runAsync('DELETE FROM funds WHERE user_id = ?', userId);
}

// --- Fon (Fund) İşlemleri ---

export async function getFunds(userId) {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM funds WHERE user_id = ? ORDER BY symbol ASC', userId);
}

export async function addFund(userId, fund) {
  const db = await getDB();
  const res = await db.runAsync(
    'INSERT INTO funds (user_id, name, symbol, shares, purchase_price, current_price) VALUES (?, ?, ?, ?, ?, ?)',
    userId,
    fund.name,
    fund.symbol.toUpperCase(),
    fund.shares,
    fund.purchasePrice,
    fund.currentPrice
  );
  return res.lastInsertRowId;
}

export async function updateFundCurrentPrice(userId, id, price) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE funds SET current_price = ? WHERE id = ? AND user_id = ?',
    price,
    id,
    userId
  );
}

export async function deleteFund(userId, id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM funds WHERE id = ? AND user_id = ?', id, userId);
}
