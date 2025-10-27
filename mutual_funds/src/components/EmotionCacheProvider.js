'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

export default function EmotionCacheProvider({ children }) {
  const [cache] = useState(() => {
    if (typeof document !== 'undefined') {
      const insertionPoint = document.querySelector('meta[name="emotion-insertion-point"]');
      return createCache({ key: 'mui', insertionPoint: insertionPoint || undefined });
    }
    return createCache({ key: 'mui' });
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
