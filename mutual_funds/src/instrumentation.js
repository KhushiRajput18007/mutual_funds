import cron from 'node-cron';
import { updateActiveFunds } from './lib/fundUpdater';

export async function register() {
  // Only enable cron when explicitly requested
  if (process.env.ENABLE_CRON !== '1') {
    return;
  }

  try {
    if (!globalThis.__activeFundsCronStarted) {
      globalThis.__activeFundsCronStarted = true;

      cron.schedule('0 7 * * *', async () => {
        try {
          await updateActiveFunds(console);
        } catch (e) {
          console.error('[Cron] Active funds update failed:', e);
        }
      }, { timezone: 'Asia/Kolkata' });

      if (process.env.CRON_RUN_ON_BOOT === '1') {
        updateActiveFunds(console).catch((e) => {
          console.error('[Cron] Initial active funds update failed:', e);
        });
      }
    }
  } catch (e) {
    console.error('Failed to start cron scheduler:', e);
  }
}
