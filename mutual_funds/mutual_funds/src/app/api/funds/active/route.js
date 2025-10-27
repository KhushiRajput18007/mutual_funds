import { NextResponse } from 'next/server';
import axios from 'axios';
import { dbConnect } from '../../../../lib/db';
import { Fund } from '../../../../models/Fund';

export async function GET() {
  try {
    await dbConnect();
    const docs = await Fund.find({ isActive: true })
      .sort({ lastUpdated: -1 })
      .limit(100)
      .lean();
    return NextResponse.json(docs);
  } catch (e) {
    // Fallback: compute a small active sample from MFAPI
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const listRes = await axios.get('https://api.mfapi.in/mf', { signal: controller.signal, timeout: 12000, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!listRes || listRes.status < 200 || listRes.status >= 300) throw new Error('MFAPI list failed');
      const list = listRes.data;
      const sample = Array.isArray(list) ? list.slice(0, 20) : [];
      const results = [];
      for (const f of sample) {
        try {
          const c2 = new AbortController();
          const t2 = setTimeout(() => c2.abort(), 12000);
          const res = await axios.get(`https://api.mfapi.in/mf/${f.schemeCode}`, { signal: c2.signal, timeout: 12000, headers: { Accept: 'application/json' } });
          clearTimeout(t2);
          if (!res || res.status < 200 || res.status >= 300) continue;
          const data = res.data;
          const arr = Array.isArray(data?.data) ? data.data : [];
          if (arr.length < 1) continue;
          const latest = parseFloat(arr[0].nav);
          results.push({
            _id: `${f.schemeCode}`,
            schemeCode: `${f.schemeCode}`,
            name: f.schemeName,
            category: data?.meta?.scheme_category || 'Unknown',
            nav: latest,
            navChangePercent: arr.length > 1 ? (((parseFloat(arr[0].nav) - parseFloat(arr[1].nav)) / parseFloat(arr[1].nav)) * 100) : 0,
            lastUpdated: new Date().toISOString(),
          });
        } catch (_) {}
      }
      // Sort by lastUpdated desc then nav desc
      results.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated) || (b.nav || 0) - (a.nav || 0));
      return NextResponse.json(results);
    } catch (err) {
      // Final fallback: empty array with 200
      return NextResponse.json([]);
    }
  }
}
