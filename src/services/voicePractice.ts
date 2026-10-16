/**
 * Service Latihan Bicara & Speech Recognition yang aman untuk Expo Go maupun Standalone build.
 * Menggunakan pemuatan malas (lazy try-require) agar tidak crash jika modul native
 * tidak disertakan di Expo Go client.
 */

let speechModule: any = null;
let triedLoad = false;

function getNativeModule(): any {
  if (triedLoad) return speechModule;
  triedLoad = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-speech-recognition');
    if (mod?.ExpoSpeechRecognitionModule) {
      speechModule = mod.ExpoSpeechRecognitionModule;
    }
  } catch {
    speechModule = null;
  }
  return speechModule;
}

export class VoicePracticeService {
  isSupported(): boolean {
    const mod = getNativeModule();
    return Boolean(mod?.requestPermissionsAsync);
  }

  async requestPermissions(): Promise<boolean> {
    const mod = getNativeModule();
    if (!mod?.requestPermissionsAsync) return false;
    try {
      const res = await mod.requestPermissionsAsync();
      return Boolean(res?.granted);
    } catch {
      return false;
    }
  }

  startListening(options: { lang?: string; interimResults?: boolean; continuous?: boolean } = {}): boolean {
    const mod = getNativeModule();
    if (!mod?.start) return false;
    try {
      mod.start({
        lang: options.lang ?? 'id-ID',
        interimResults: options.interimResults ?? true,
        continuous: options.continuous ?? true,
      });
      return true;
    } catch {
      return false;
    }
  }

  stopListening(): void {
    const mod = getNativeModule();
    try {
      mod?.stop?.();
    } catch {
      // Abaikan
    }
  }

  abort(): void {
    const mod = getNativeModule();
    try {
      mod?.abort?.();
    } catch {
      // Abaikan
    }
  }
}

export const voicePractice = new VoicePracticeService();
