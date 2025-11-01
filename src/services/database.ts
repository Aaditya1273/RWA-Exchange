import Database from 'better-sqlite3';
import path from 'path';

// Database file location
const DB_PATH = path.join(process.cwd(), 'rwa-exchange.db');

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export function initializeDatabase() {
  // Properties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      location TEXT,
      property_type TEXT,
      total_value INTEGER NOT NULL,
      total_shares INTEGER NOT NULL,
      available_shares INTEGER NOT NULL,
      price_per_share INTEGER NOT NULL,
      rental_yield TEXT,
      is_active INTEGER DEFAULT 1,
      owner TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Investments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      investor TEXT NOT NULL,
      shares_owned INTEGER NOT NULL,
      investment_amount INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      from_address TEXT,
      to_address TEXT,
      property_id TEXT,
      investment_id TEXT,
      amount INTEGER,
      shares INTEGER,
      status TEXT DEFAULT 'completed',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
}

// Property operations
export const propertyDB = {
  create: (property: any) => {
    const stmt = db.prepare(`
      INSERT INTO properties (
        id, name, description, image_url, location, property_type,
        total_value, total_shares, available_shares, price_per_share,
        rental_yield, owner
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      property.id,
      property.name,
      property.description,
      property.imageUrl,
      property.location,
      property.propertyType,
      property.totalValue,
      property.totalShares,
      property.totalShares, // available_shares = total_shares initially
      property.pricePerShare,
      property.rentalYield,
      property.owner
    );
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM properties WHERE is_active = 1 ORDER BY created_at DESC');
    return stmt.all();
  },

  getById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
    return stmt.get(id);
  },

  updateAvailableShares: (propertyId: string, sharesPurchased: number) => {
    const stmt = db.prepare(`
      UPDATE properties 
      SET available_shares = available_shares - ? 
      WHERE id = ?
    `);
    return stmt.run(sharesPurchased, propertyId);
  },
};

// Investment operations
export const investmentDB = {
  create: (investment: any) => {
    const stmt = db.prepare(`
      INSERT INTO investments (
        id, property_id, investor, shares_owned, investment_amount
      ) VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      investment.id,
      investment.propertyId,
      investment.investor,
      investment.sharesOwned,
      investment.investmentAmount
    );
  },

  getByInvestor: (investorAddress: string) => {
    const stmt = db.prepare(`
      SELECT i.*, p.name as property_name, p.total_shares
      FROM investments i
      JOIN properties p ON i.property_id = p.id
      WHERE i.investor = ?
      ORDER BY i.timestamp DESC
    `);
    return stmt.all(investorAddress);
  },

  getByProperty: (propertyId: string) => {
    const stmt = db.prepare('SELECT * FROM investments WHERE property_id = ?');
    return stmt.all(propertyId);
  },

  transfer: (investmentId: string, newOwner: string) => {
    const stmt = db.prepare('UPDATE investments SET investor = ? WHERE id = ?');
    return stmt.run(newOwner, investmentId);
  },
};

// Transaction operations
export const transactionDB = {
  create: (transaction: any) => {
    const stmt = db.prepare(`
      INSERT INTO transactions (
        id, type, from_address, to_address, property_id, 
        investment_id, amount, shares
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      transaction.id,
      transaction.type,
      transaction.fromAddress,
      transaction.toAddress,
      transaction.propertyId,
      transaction.investmentId,
      transaction.amount,
      transaction.shares
    );
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 100');
    return stmt.all();
  },

  getByAddress: (address: string) => {
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE from_address = ? OR to_address = ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(address, address);
  },
};

// Initialize on import
initializeDatabase();

export default db;
