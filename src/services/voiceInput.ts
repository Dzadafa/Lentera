/**
 * Input suara (Speech-to-Text) untuk latihan grounding.
 *
 * Prinsip:
 * - Modul dimuat malas (`require` di dalam try/catch) supaya aplikasi tetap
 *   jalan di perangkat/versi build yang tidak menyertakan modul native ini.
 * - `requiresOnDeviceRecognition` diutamakan; bila perangkat tidak punya model
 *   luring, otomatis jatuh ke recognizer bawaan tanpa mengubah alur UI.
 * - Tidak ada rekaman yang disimpan: `abort()` dipanggil setiap sesi berakhir.
 */

type Handlers = {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (code: string) => void;
  onEnd?: () => void;
};

let mod: any = null;
let triedLoad = false;

function loadModule(): any {
  if (triedLoad) return mod;
  triedLoad = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('expo-speech-recognition');
  } catch {
    mod = null;
  }
  return mod;
}

class VoiceInputService {
  private subs: Array<{ remove: () => void }> = [];
  private active = false;

  isSupported(): boolean {
    const m = loadModule();
    if (!m?.ExpoSpeechRecognitionModule) return false;
    try {
      return Boolean(m.ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      return false;
    }
  }

  supportsOnDevice(): boolean {
    const m = loadModule();
    try {
      return Boolean(m?.ExpoSpeechRecognitionModule?.supportsOnDeviceRecognition?.());
    } catch {
      return false;
    }
  }

  isActive(): boolean {
    return this.active;
  }

  private clearSubs() {
    this.subs.forEach((s) => {
      try {
        s.remove();
      } catch {
        // ignore
      }
    });
    this.subs = [];
  }

  async start(handlers: Handlers): Promise<boolean> {
    const m = loadModule();
    if (!m?.ExpoSpeechRecognitionModule) {
      handlers.onError?.('unavailable');
      return false;
    }
    const M = m.ExpoSpeechRecognitionModule;

    try {
      const perm = await M.requestPermissionsAsync();
      if (!perm?.granted) {
        handlers.onError?.('not-allowed');
        return false;
      }
    } catch {
      handlers.onError?.('not-allowed');
      return false;
    }

    this.clearSubs();
    this.subs.push(
      M.addListener('result', (e: any) => {
        const transcript: string = e?.results?.[0]?.transcript ?? '';
        if (!transcript) return;
        if (e?.isFinal) handlers.onFinal(transcript.trim());
        else handlers.onInterim?.(transcript);
      })
    );
    this.subs.push(
      M.addListener('error', (e: any) => {
        this.active = false;
        handlers.onError?.(String(e?.error ?? 'unknown'));
        handlers.onEnd?.();
      })
    );
    this.subs.push(
      M.addListener('end', () => {
        this.active = false;
        handlers.onEnd?.();
      })
    );

    try {
      M.start({
        lang: 'id-ID',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        requiresOnDeviceRecognition: this.supportsOnDevice(),
        addsPunctuation: false,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: 'free_form',
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1600,
          EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1100,
          EXTRA_PREFER_OFFLINE: true,
        },
      });
      this.active = true;
      return true;
    } catch {
      this.active = false;
      handlers.onError?.('client');
      return false;
    }
  }

  stop() {
    const m = loadModule();
    try {
      m?.ExpoSpeechRecognitionModule?.stop();
    } catch {
      // ignore
    }
    this.active = false;
  }

  cancel() {
    const m = loadModule();
    try {
      m?.ExpoSpeechRecognitionModule?.abort();
    } catch {
      // ignore
    }
    this.active = false;
    this.clearSubs();
  }
}

export const voiceInput = new VoiceInputService();
