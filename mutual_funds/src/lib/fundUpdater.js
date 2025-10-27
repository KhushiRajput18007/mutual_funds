import getClientPromise from './mongodb';
import { COLLECTIONS } from './models';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function updateActiveFunds(logger = console) {
  let db = null;
  try {
    const client = await getClientPromise;
    db = client.db('mutual_funds');
  } catch (e) {
    logger.warn('[ActiveFunds] DB unavailable, will compute without writing:', e?.message || e);
  }
  const today = new Date();
  const target = new Date(today);
  target.setDate(target.getDate() - 1); // Use previous day
  const targetStr = target.toISOString().split('T')[0];

  logger.log(`[ActiveFunds] Start update for previous day ${targetStr}`);

  // Fetch all schemes list
  const schemes = await fetchJSON('https://api.mfapi.in/mf');
  logger.log(`[ActiveFunds] Total schemes from source: ${schemes.length}`);

  // Helper to limit concurrency
  const limit = 10;
  const active = [];

  async function processScheme(s) {
    try {
      const data = await fetchJSON(`https://api.mfapi.in/mf/${s.schemeCode}`);
      const arr = Array.isArray(data.data) ? data.data : [];
      const entry = arr.find((d) => d.date === targetStr) || null;
      if (!entry) return;
      active.push({
        schemeCode: s.schemeCode,
        schemeName: s.schemeName,
        date: targetStr,
        nav: parseFloat(entry.nav)
      });
    } catch (e) {
      // swallow individual errors to keep batch going
    }
  }

  let idx = 0;
  async function nextBatch() {
    const batch = [];
    for (let i = 0; i < limit && idx < schemes.length; i++, idx++) {
      batch.push(processScheme(schemes[idx]));
    }
    if (batch.length) {
      await Promise.all(batch);
      return nextBatch();
    }
  }
  await nextBatch();

  logger.log(`[ActiveFunds] Active for ${targetStr}: ${active.length}`);

  // Upsert active list for today if DB is available
  if (db) {
    try {
      const col = db.collection(COLLECTIONS.ACTIVE_SCHEMES);
      await col.deleteMany({ date: targetStr });
      if (active.length) {
        await col.insertMany(active);
      }
      logger.log(`[ActiveFunds] Update completed and written to DB.`);
    } catch (e) {
      logger.warn('[ActiveFunds] Failed to write to DB, returning computed list only:', e?.message || e);
    }
  } else {
    logger.log(`[ActiveFunds] DB unavailable; returning computed list without persisting.`);
  }

  return { date: targetStr, count: active.length };
}
