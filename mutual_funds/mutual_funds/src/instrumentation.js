import cron from 'node-cron';
import { updateActiveFunds } from './lib/fundUpdater';
import { updateActiveFundsCache } from './lib/activeFundsCache';
import { initializeCommissionCronJobs } from './lib/commissionCron';

export async function register() {
  // Only enable cron when explicitly requested
  if (process.env.ENABLE_CRON !== '1') {
    return;
  }

  try {
    if (!globalThis.__activeFundsCronStarted) {
      globalThis.__activeFundsCronStarted = true;

      // Existing daily updater at 7AM IST (if used elsewhere)
      cron.schedule('0 7 * * *', async () => {
        try {
          await updateActiveFunds(console);
        } catch (e) {
          console.error('[Cron] Active funds update failed:', e);
        }
      }, { timezone: 'Asia/Kolkata' });

      // New: update cached active funds every 12 hours
      cron.schedule('0 */12 * * *', async () => {
        try {
          await updateActiveFundsCache(console);
        } catch (e) {
          console.error('[Cron] ActiveFundsCache update failed:', e);
        }
      }, { timezone: 'Asia/Kolkata' });

      if (process.env.CRON_RUN_ON_BOOT === '1') {
        // Fire both updaters once on boot (non-blocking)
        updateActiveFunds(console).catch((e) => {
          console.error('[Cron] Initial active funds update failed:', e);
        });
        updateActiveFundsCache(console).catch((e) => {
          console.error('[Cron] Initial ActiveFundsCache update failed:', e);
        });
      }

      // Initialize commission cron jobs (1st and 5th schedule)
      if (!globalThis.__commissionCronStarted) {
        try {
          initializeCommissionCronJobs();
          globalThis.__commissionCronStarted = true;
        } catch (e) {
          console.error('[Cron] Commission cron init failed:', e);
        }
      }
    }
  } catch (e) {
    console.error('Failed to start cron scheduler:', e);
  }
}
