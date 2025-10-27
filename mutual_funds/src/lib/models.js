// Database Models and Collections

export const COLLECTIONS = {
  SCHEMES: 'schemes',
  SCHEME_DATA: 'scheme_data',
  NAV_HISTORY: 'nav_history',
  PORTFOLIOS: 'portfolios',
  USERS: 'users',
  CALCULATIONS: 'calculations',
  NOTIFICATIONS: 'notifications',
  WATCHLIST: 'watchlist',
  VIRTUAL_PORTFOLIO: 'virtual_portfolio',
  ACTIVE_SCHEMES: 'active_schemes'
};

// Scheme model
export const createSchemeIndex = async (db) => {
  await db.collection(COLLECTIONS.SCHEMES).createIndex({ schemeCode: 1 }, { unique: true });
  await db.collection(COLLECTIONS.SCHEMES).createIndex({ schemeName: 'text' });
};

// NAV History model
export const createNavHistoryIndex = async (db) => {
  await db.collection(COLLECTIONS.NAV_HISTORY).createIndex({ schemeCode: 1, date: -1 });
  await db.collection(COLLECTIONS.NAV_HISTORY).createIndex({ schemeCode: 1 });
};

// Portfolio model
export const createPortfolioIndex = async (db) => {
  await db.collection(COLLECTIONS.PORTFOLIOS).createIndex({ userId: 1 });
  await db.collection(COLLECTIONS.PORTFOLIOS).createIndex({ userId: 1, schemeCode: 1 });
};

// Calculations model
export const createCalculationsIndex = async (db) => {
  await db.collection(COLLECTIONS.CALCULATIONS).createIndex({ schemeCode: 1, type: 1 });
  await db.collection(COLLECTIONS.CALCULATIONS).createIndex({ createdAt: 1 });
};

// Watchlist model
export const createWatchlistIndex = async (db) => {
  await db.collection(COLLECTIONS.WATCHLIST).createIndex({ userId: 1 });
  await db.collection(COLLECTIONS.WATCHLIST).createIndex({ userId: 1, schemeCode: 1 }, { unique: true });
};

// Virtual Portfolio model
export const createVirtualPortfolioIndex = async (db) => {
  await db.collection(COLLECTIONS.VIRTUAL_PORTFOLIO).createIndex({ userId: 1 });
  await db.collection(COLLECTIONS.VIRTUAL_PORTFOLIO).createIndex({ userId: 1, schemeCode: 1 });
};

// Active Schemes model
export const createActiveSchemesIndex = async (db) => {
  await db.collection(COLLECTIONS.ACTIVE_SCHEMES).createIndex({ schemeCode: 1 }, { unique: true });
  await db.collection(COLLECTIONS.ACTIVE_SCHEMES).createIndex({ date: -1 });
};