import * as Speech from 'expo-speech';

/**
 * Pembaca teks (Text-to-Speech) Bahasa Indonesia.
 *
 * Dipakai untuk memandu latihan Ruang Tenang tanpa harus melihat layar —
 * pengguna bisa menutup mata dan hanya mengikuti suara + getaran.
 * Seluruh proses berjalan di mesin TTS bawaan perangkat, tanpa jaringan.
 */
class SpeechService {
  private enabled: boolean = true;

  setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      void this.stop();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async speak(
    text: string,
    opts?: { rate?: number; pitch?: number; interrupt?: boolean }
  ): Promise<void> {
    if (!this.enabled || !text.trim()) return;
    try {
      if (opts?.interrupt !== false) {
        await Speech.stop();
      }
      Speech.speak(text, {
        language: 'id-ID',
        rate: opts?.rate ?? 0.92,
        pitch: opts?.pitch ?? 1.0,
      });
    } catch {
      // Mesin TTS tidak tersedia — abaikan, getaran tetap berjalan.
    }
  }

  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch {
      // ignore
    }
  }
}

export const speech = new SpeechService();
