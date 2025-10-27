import { NextResponse } from 'next/server';
import getClientPromise from '../../../lib/mongodb';
import { COLLECTIONS } from '../../../lib/models';
import axios from 'axios';

// Simple in-memory cache (per server instance)
let CACHE = { data: null, at: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchJSON(url, { timeoutMs = 10000 } = {}) {
  const res = await axios.get(url, { timeout: timeoutMs, headers: { Accept: 'application/json' } });
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.data;
}

async function fetchWithRetry(url, { timeoutMs, retries = 2, backoffMs = 1000 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fetchJSON(url, { timeoutMs });
    } catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
      attempt++;
    }
  }
}

async function computePreviousDayActive(targetStr, sampleLimit = 250, perFetchTimeout = 8000) {
  // Fetch limited schemes to avoid heavy load when DB is unavailable
  const all = await fetchWithRetry('https://api.mfapi.in/mf', { timeoutMs: perFetchTimeout, retries: 2, backoffMs: 800 });
  const schemes = Array.isArray(all) ? all.slice(0, sampleLimit) : [];
  const active = [];
  const concurrency = 10;
  let idx = 0;
  async function processScheme(s) {
    try {
      const data = await fetchWithRetry(`https://api.mfapi.in/mf/${s.schemeCode}`, { timeoutMs: perFetchTimeout, retries: 1, backoffMs: 500 });
      const arr = Array.isArray(data?.data) ? data.data : [];
      const entry = arr.find((d) => d.date === targetStr);
      if (!entry) return;
      active.push({
        schemeCode: s.schemeCode,
        schemeName: s.schemeName,
        date: targetStr,
        nav: parseFloat(entry.nav)
      });
    } catch (_) {}
  }
  async function nextBatch() {
    const batch = [];
    for (let i = 0; i < concurrency && idx < schemes.length; i++, idx++) {
      batch.push(processScheme(schemes[idx]));
    }
    if (batch.length) {
      await Promise.all(batch);
      return nextBatch();
    }
  }
  await nextBatch();
  return active;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const skip = Math.max(0, parseInt(searchParams.get('skip') || '0', 10));
  const limit = Math.max(0, parseInt(searchParams.get('limit') || '0', 10));
  const fallbackSample = Math.max(1, Math.min(5000, parseInt(searchParams.get('sampleLimit') || '500', 10)));
  // Serve fresh cache if available
  if (CACHE.data && Date.now() - CACHE.at < TTL_MS) {
    const data = Array.isArray(CACHE.data) ? CACHE.data : [];
    const page = limit > 0 ? data.slice(skip, skip + limit) : data;
    return NextResponse.json(page);
  }
  try {
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const today = new Date();
    const target = new Date(today);
    target.setDate(target.getDate() - 1); // previous day
    const targetStr = target.toISOString().split('T')[0];

    const col = db.collection(COLLECTIONS.ACTIVE_SCHEMES);
    let cursor = col.find({ date: targetStr }).project({ _id: 0 });
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);
    let docs = await cursor.toArray();

    if (!docs || docs.length === 0) {
      // Fallback: find the latest available date not after targetStr
      const latest = await col
        .find({ date: { $lte: targetStr } })
        .project({ _id: 0, date: 1 })
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      const latestDate = latest?.[0]?.date;
      if (latestDate) {
        let cur2 = col.find({ date: latestDate }).project({ _id: 0 });
        if (skip) cur2 = cur2.skip(skip);
        if (limit) cur2 = cur2.limit(limit);
        docs = await cur2.toArray();
      } else {
        // As a last resort, compute from MFAPI directly to avoid empty UI
        try {
          const computed = await computePreviousDayActive(targetStr, fallbackSample, 15000);
          // Cache full computed list
          CACHE = { data: computed, at: Date.now() };
          docs = limit > 0 ? computed.slice(skip, skip + limit) : computed;
        } catch (_) {
          docs = [];
        }
      }
    }

    // When reading from DB, don't cache paginated subset; fetch full only when limit omitted
    if (!limit && !skip) {
      // If this was a DB read, we would need another query to cache full set; skip caching to avoid heavy reads
    }
    return NextResponse.json(docs);
  } catch (e) {
    try {
      // DB unavailable: compute previous day from MFAPI as fallback
      const t = new Date();
      t.setDate(t.getDate() - 1);
      const targetStr = t.toISOString().split('T')[0];
      const computed = await computePreviousDayActive(targetStr, fallbackSample, 15000);
      CACHE = { data: computed, at: Date.now() };
      const page = limit > 0 ? computed.slice(skip, skip + limit) : computed;
      return NextResponse.json(page);
    } catch (err) {
      console.error('active-funds MFAPI fallback failed', err);
      return NextResponse.json([]);
    }
  }
}
