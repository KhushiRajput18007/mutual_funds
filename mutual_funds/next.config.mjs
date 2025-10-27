/** @type {import('next').NextConfig} */

// Start the Active Funds cron job once when the server starts
if (!global.__ACTIVE_FUNDS_CRON_STARTED__ && typeof window === 'undefined') {
  try {
    // Dynamic import to avoid issues during build
    import('./src/lib/activeFundsCron.js').then(({ startActiveFundsCron }) => {
      startActiveFundsCron();
      global.__ACTIVE_FUNDS_CRON_STARTED__ = true;
      console.log('🚀 Active Funds cron job initialized at server startup');
    }).catch(e => {
      console.error('❌ Failed to start Active Funds cron:', e);
    });
  } catch (e) {
    console.error('❌ Error importing Active Funds cron:', e);
  }
}

const nextConfig = {};

export default nextConfig;
