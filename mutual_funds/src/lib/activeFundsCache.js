import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(DATA_DIR, 'activeFunds.json');
const MAX_SCHEMES = parseInt(process.env.ACTIVE_FUNDS_MAX_SCHEMES || '', 10) || undefined;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readJson(filePath) {
  try {
    const buf = await fs.readFile(filePath, 'utf8');
    return JSON.parse(buf);
  } catch {
    return null;
  }
}

async function writeJson(filePath, obj) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

async function fetchWithTimeout(url, ms = 45000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function updateActiveFundsCache(logger = console) {
  try {
    // Attempt to fetch from MFAPI list
    const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 45000);
    if (!listRes.ok) throw new Error(`MFAPI list failed: ${listRes.status}`);
    const list = await listRes.json();
    if (!Array.isArray(list) || list.length === 0) throw new Error('MFAPI returned empty list');

    // Process more schemes to find active funds - set to 1000 schemes by default
    const maxSchemes = typeof MAX_SCHEMES === 'number' ? MAX_SCHEMES : 1000;
    const sample = list.slice(0, maxSchemes);
    logger?.log?.(`[ActiveFundsCache] Processing ${sample.length} schemes from MFAPI to find active funds`);
    
    // Lower concurrency to reduce throttling/aborts
    const concurrency = 6;
    let i = 0;
    const activeFunds = [];
    let successCount = 0;
    let errorCount = 0;

    async function worker() {
      while (i < sample.length) {
        const idx = i++;
        const f = sample[idx];
        
        if (idx % 50 === 0) {
          logger?.log?.(`[ActiveFundsCache] Progress: ${idx}/${sample.length} (${successCount} success, ${errorCount} errors)`);
        }
        
        // Retry up to 2 times with backoff
        const attempts = [0, 800, 2000];
        for (let a = 0; a < attempts.length; a++) {
          if (a > 0) await new Promise(r => setTimeout(r, attempts[a]));
          try {
            const res = await fetchWithTimeout(`https://api.mfapi.in/mf/${f.schemeCode}`, 30000);
            if (!res.ok) throw new Error(`Detail ${res.status}`);
            const data = await res.json();
            
            const meta = data?.meta || {};
            const arr = Array.isArray(data?.data) ? data.data : [];
            
            if (arr.length > 0) {
              const nav = parseFloat(arr[0].nav);
              const navDate = arr[0].date;
              
              if (nav && nav > 0) {
                // Check all possible ISIN field variations
                const isinGrowth = meta.isin_growth || meta.isinGrowth || meta.ISIN_Growth || 
                                  meta['ISIN Growth'] || null;
                const isinDiv = meta.isin_div || meta.isinDiv || meta.ISIN_Div || 
                               meta['ISIN Div'] || null;
                
                // More flexible active fund detection:
                const hasValidIsinGrowth = isinGrowth && 
                                          String(isinGrowth).trim() !== '' && 
                                          String(isinGrowth).trim().toLowerCase() !== 'null' &&
                                          String(isinGrowth).trim() !== 'undefined';
                                          
                const hasValidIsinDiv = isinDiv && 
                                       String(isinDiv).trim() !== '' && 
                                       String(isinDiv).trim().toLowerCase() !== 'null' &&
                                       String(isinDiv).trim() !== 'undefined';
                
                const hasSubstantialMeta = Object.keys(meta).length >= 5 && 
                                          (meta.scheme_category || meta.fund_house) &&
                                          (meta.scheme_type);
                
                // Consider fund active if:
                // 1. Has valid ISIN Growth (primary criterion)
                // 2. Has valid ISIN Div (secondary)
                // 3. Has substantial metadata (fallback for funds with good data)
                const isActiveByIsinGrowth = hasValidIsinGrowth;
                const isActiveByIsinDiv = !hasValidIsinGrowth && hasValidIsinDiv;
                const isActiveByMeta = !hasValidIsinGrowth && !hasValidIsinDiv && hasSubstantialMeta;
                
                if (isActiveByIsinGrowth || isActiveByIsinDiv || isActiveByMeta) {
                  const fund = {
                    fundName: f.schemeName,
                    nav: nav,
                    navDate: navDate,
                    category: meta.scheme_category || meta.category || 'Mutual Fund',
                    schemeCode: String(f.schemeCode),
                    fundType: meta.fund_house || 'Unknown',
                    isinGrowth: isinGrowth,
                    isinDiv: isinDiv,
                    schemeType: meta.scheme_type || 'Open Ended',
                    isActiveReason: isActiveByIsinGrowth ? 'Has ISIN Growth' : 
                                   isActiveByIsinDiv ? 'Has ISIN Div' : 'Has Metadata',
                    hasValidIsinGrowth: hasValidIsinGrowth,
                    hasValidIsinDiv: hasValidIsinDiv,
                    metaFieldCount: Object.keys(meta).length
                  };
                  
                  activeFunds.push(fund);
                  successCount++;
                }
              }
            }
            break; // success
          } catch (e) {
            if (a === attempts.length - 1) {
              errorCount++;
              if (logger?.debug) logger.debug(`Skip scheme ${f.schemeCode} due to error:`, e?.message);
            }
          }
        }
      }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    logger?.log?.(`[ActiveFundsCache] Completed processing: ${successCount} funds collected, ${errorCount} errors`);

    const payload = {
      generatedAt: new Date().toISOString(),
      count: activeFunds.length,
      processedSchemes: sample.length,
      successCount,
      errorCount,
      activeFunds,
    };
    await writeJson(CACHE_FILE, payload);
    logger?.log?.(`[ActiveFundsCache] Updated cache with ${activeFunds.length} active funds`);
    return payload;
  } catch (e) {
    logger?.error?.('[ActiveFundsCache] Failed to update cache:', e);
    throw e;
  }
}

export async function readActiveFundsFromCache() {
  const json = await readJson(CACHE_FILE);
  return json && Array.isArray(json.activeFunds) ? json.activeFunds : [];
}

export async function getOrUpdateActiveFunds(logger = console) {
  const cached = await readActiveFundsFromCache();
  if (cached.length > 0) return cached;
  await updateActiveFundsCache(logger);
  return await readActiveFundsFromCache();
}
