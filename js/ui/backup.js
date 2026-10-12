// Backup: download everything as a JSON file, and decide when to remind the person to do it.
import { state, save } from '../store.js';
import { toast, haptic, HAPTIC } from './state.js';
import { t } from '../i18n.js';

const DAY = 864e5;
export const daysSince = ts => Math.max(0, Math.floor((Date.now() - ts) / DAY));

export function downloadBackup({ quiet = false } = {}) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'hisaab', ...state }, null, 2)], { type: 'application/json' }));
  a.download = `hisaab-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  state.lastBackup = Date.now(); state.backupSnooze = null; save();
  haptic(HAPTIC.CONFIRM); if (!quiet) toast.success(t('toastBackupDownloaded'));
}

// Nothing to lose yet: no reminder. Never backed up: remind after 2 weeks of use. Backed up before: remind after 30 days.
// "Later" hides the reminder for a week.
export function backupDue() {
  if (!Object.keys(state.days).length && !Object.keys(state.monthPrice).length) return false;
  if (state.backupSnooze && state.backupSnooze > Date.now()) return false;
  const ref = state.lastBackup ?? state.installedAt;
  return !!ref && Date.now() - ref > (state.lastBackup ? 30 : 14) * DAY;
}
export const snoozeBackup = () => { state.backupSnooze = Date.now() + 7 * DAY; save(); };
