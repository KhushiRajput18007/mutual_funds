'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function Card({ fund, onClick }) {
  const isUp = typeof fund?.navChangePercent === 'number' && fund.navChangePercent >= 0;
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 hover:bg-white dark:hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{fund.name}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{fund.category || '—'}</div>
        </div>
        <div className={`ml-3 text-xs px-2 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>
          {isUp ? '▲' : '▼'} {typeof fund.navChangePercent === 'number' ? fund.navChangePercent.toFixed(2) : '0.00'}%
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-zinc-600 dark:text-zinc-400">NAV: <span className="font-medium text-zinc-900 dark:text-zinc-100">{typeof fund.nav === 'number' ? fund.nav.toFixed(2) : '—'}</span></div>
        {fund.lastUpdated && (
          <div className="text-zinc-500 dark:text-zinc-400">{new Date(fund.lastUpdated).toLocaleDateString()}</div>
        )}
      </div>
    </button>
  );
}

function Section({ title, subtitle, items, loading, error, onCardClick, sectionRef }) {
  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold">{subtitle}</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{title}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">Loading funds...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-4">{error}
          <button onClick={() => location.reload()} className="ml-4 inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 text-zinc-600 dark:text-zinc-400">No data yet. Please run the updater or try again later.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f) => (
            <Card key={f._id} fund={f} onClick={() => onCardClick(f)} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function TrendingActivePage() {
  const [trending, setTrending] = useState([]);
  const [active, setActive] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [errT, setErrT] = useState('');
  const [errA, setErrA] = useState('');
  const search = useSearchParams();
  const [activeRef, setActiveRef] = useState(null);
  const [trendRef, setTrendRef] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingT(true);
        const res = await fetch('/api/funds/trending', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load trending');
        setTrending(await res.json());
      } catch (e) {
        setErrT('Unable to load trending funds.');
      } finally {
        setLoadingT(false);
      }

      try {
        setLoadingA(true);
        const res = await fetch('/api/funds/active', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load active');
        setActive(await res.json());
      } catch (e) {
        setErrA('Unable to load active funds.');
      } finally {
        setLoadingA(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const show = (search?.get && search.get('show')) || '';
    const ref = show === 'active' ? activeRef : show === 'trending' ? trendRef : null;
    if (ref?.scrollIntoView) {
      setTimeout(() => ref.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [search, activeRef, trendRef]);

  const onCardClick = async (f) => {
    try {
      await fetch(`/api/funds/${f._id}/view`, { method: 'POST' });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Trending & Active Mutual Funds</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Daily updates powered by MFAPI and user engagement.</p>
        <div className="mt-4 flex gap-2">
          <a href="/" className="text-sm underline">Home</a>
          <a href="/funds" className="text-sm underline">Browse Funds</a>
        </div>
      </header>

      <Section
        title="Trending Funds"
        subtitle="Top movers"
        items={trending}
        loading={loadingT}
        error={errT}
        onCardClick={onCardClick}
        sectionRef={setTrendRef}
      />

      <Section
        title="Active Funds"
        subtitle="Updated in last 24h"
        items={active}
        loading={loadingA}
        error={errA}
        onCardClick={onCardClick}
        sectionRef={setActiveRef}
      />

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-zinc-500 dark:text-zinc-400">
        Data from MFAPI.in • Trend score combines NAV change and user views.
      </footer>
    </div>
  );
}
