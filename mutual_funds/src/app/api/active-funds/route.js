import { NextResponse } from 'next/server';
import getClientPromise from '../../../lib/mongodb';
import { COLLECTIONS } from '../../../lib/models';

async function fetchJSON(url, { timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function computePreviousDayActive(targetStr, sampleLimit = 250, perFetchTimeout = 8000) {
  // Fetch limited schemes to avoid heavy load when DB is unavailable
  const all = await fetchJSON('https://api.mfapi.in/mf', { timeoutMs: perFetchTimeout });
  const schemes = Array.isArray(all) ? all.slice(0, sampleLimit) : [];
  const active = [];
  const concurrency = 10;
  let idx = 0;
  async function processScheme(s) {
    try {
      const data = await fetchJSON(`https://api.mfapi.in/mf/${s.schemeCode}`, { timeoutMs: perFetchTimeout });
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

export async function GET() {
  try {
    const client = await getClientPromise;
    const db = client.db('mutual_funds');
    const today = new Date();
    const target = new Date(today);
    target.setDate(target.getDate() - 1); // previous day
    const targetStr = target.toISOString().split('T')[0];

    const col = db.collection(COLLECTIONS.ACTIVE_SCHEMES);
    let docs = await col
      .find({ date: targetStr })
      .project({ _id: 0 })
      .limit(500)
      .toArray();

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
        docs = await col
          .find({ date: latestDate })
          .project({ _id: 0 })
          .limit(500)
          .toArray();
      } else {
        // As a last resort, compute from MFAPI directly to avoid empty UI
        try {
          docs = await computePreviousDayActive(targetStr);
        } catch (_) {
          docs = [];
        }
      }
    }

    return NextResponse.json(docs);
  } catch (e) {
    try {
      // DB unavailable: compute previous day from MFAPI as fallback
      const t = new Date();
      t.setDate(t.getDate() - 1);
      const targetStr = t.toISOString().split('T')[0];
      const docs = await computePreviousDayActive(targetStr);
      return NextResponse.json(docs);
    } catch (err) {
      console.error('active-funds MFAPI fallback failed', err);
      return NextResponse.json([]);
    }
  }
}
