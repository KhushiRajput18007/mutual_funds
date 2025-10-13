import cron from 'node-cron';
import { updateActiveFunds } from './src/lib/fundUpdater';

export async function register() {
  try {
    // Avoid duplicate schedules during dev HMR
    if (!globalThis.__activeFundsCronStarted) {
      globalThis.__activeFundsCronStarted = true;

      // Schedule daily at 7:00 AM Asia/Kolkata
      cron.schedule('0 7 * * *', async () => {
        try {
          await updateActiveFunds(console);
        } catch (e) {
          console.error('[Cron] Active funds update failed:', e);
        }
      }, { timezone: 'Asia/Kolkata' });

      // Also trigger once on server start (non-blocking)
      updateActiveFunds(console).catch((e) => {
        console.error('[Cron] Initial active funds update failed:', e);
      });
    }
  } catch (e) {
    console.error('Failed to start cron scheduler:', e);
  }
}
