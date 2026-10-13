/**
 * Pengingat harian (notifikasi lokal).
 *
 * Dijadwalkan di perangkat sendiri lewat `expo-notifications`. Pesannya tidak
 * memuat detail klinis apa pun, sehingga tidak membocorkan kondisi pengguna
 * bila muncul di layar kunci.
 */

export const DEFAULT_HOUR = 20;
export const DEFAULT_MINUTE = 30;

let mod: any = null;
let tried = false;

function loadModule(): any {
  if (tried) return mod;
  tried = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('expo-notifications');
  } catch {
    mod = null;
  }
  return mod;
}

class ReminderService {
  isSupported(): boolean {
    return Boolean(loadModule());
  }

  async ensurePermission(): Promise<boolean> {
    const m = loadModule();
    if (!m) return false;
    try {
      const existing = await m.getPermissionsAsync();
      if (existing?.granted) return true;
      const asked = await m.requestPermissionsAsync();
      return Boolean(asked?.granted);
    } catch {
      return false;
    }
  }

  /** @returns id notifikasi, atau null bila gagal atau tidak didukung. */
  async scheduleNightly(hour = DEFAULT_HOUR, minute = DEFAULT_MINUTE): Promise<string | null> {
    const m = loadModule();
    if (!m) return null;
    const granted = await this.ensurePermission();
    if (!granted) return null;

    await this.cancelNightly();

    try {
      const id = await m.scheduleNotificationAsync({
        content: {
          title: 'Waktunya tutup hari',
          body: 'Dua menit untuk mencatat suasana hati hari ini. Tidak ada yang perlu dijelaskan.',
          data: { kind: 'checkin' },
          sound: false,
        },
        trigger: {
          type: 'daily',
          hour,
          minute,
        },
      });
      return id ?? null;
    } catch {
      return null;
    }
  }

  async cancelNightly(): Promise<void> {
    const m = loadModule();
    if (!m) return;
    try {
      const scheduled: any[] = await m.getAllScheduledNotificationsAsync();
      for (const item of scheduled) {
        if (item?.content?.data?.kind === 'checkin') {
          await m.cancelScheduledNotificationAsync(item.identifier);
        }
      }
    } catch {
      // abaikan
    }
  }

  async isNightlyActive(): Promise<boolean> {
    const m = loadModule();
    if (!m) return false;
    try {
      const scheduled: any[] = await m.getAllScheduledNotificationsAsync();
      return scheduled.some((item) => item?.content?.data?.kind === 'checkin');
    } catch {
      return false;
    }
  }
}

export const reminders = new ReminderService();
