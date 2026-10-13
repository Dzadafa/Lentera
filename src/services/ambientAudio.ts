/**
 * Pemutar suara latar luring (H4).
 *
 * Semua berkas audio dibundel di dalam aplikasi (`assets/audio`): tidak ada
 * streaming dan tidak ada jaringan. Modul audio dimuat malas supaya build yang
 * tidak menyertakan modul native tetap berjalan normal.
 */

export type AmbientTrack = 'rain' | 'waves' | 'brown';

export const AMBIENT_TRACKS: { id: AmbientTrack; label: string; hint: string }[] = [
  { id: 'rain', label: 'Hujan', hint: 'Ritmis, menutupi suara sekitar' },
  { id: 'waves', label: 'Ombak', hint: 'Lambat, seperti napas panjang' },
  { id: 'brown', label: 'Derau Coklat', hint: 'Nada rendah, menenangkan' },
];

const SOURCES: Record<AmbientTrack, number> = {
  rain: require('../../assets/audio/rain.m4a'),
  waves: require('../../assets/audio/waves.m4a'),
  brown: require('../../assets/audio/brown.m4a'),
};

let mod: any = null;
let tried = false;

function loadModule(): any {
  if (tried) return mod;
  tried = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('expo-audio');
  } catch {
    mod = null;
  }
  return mod;
}

class AmbientService {
  private player: any = null;
  private current: AmbientTrack | null = null;
  private enabled = true;

  setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isSupported(): boolean {
    return Boolean(loadModule()?.createAudioPlayer);
  }

  currentTrack(): AmbientTrack | null {
    return this.current;
  }

  private ensurePlayer(track: AmbientTrack): any {
    const m = loadModule();
    if (!m?.createAudioPlayer) return null;
    if (this.current !== track) {
      try {
        this.player?.remove?.();
      } catch {
        // perangkat tanpa dukungan pemutar: abaikan
      }
      try {
        this.player = m.createAudioPlayer(SOURCES[track]);
      } catch {
        this.player = null;
      }
      this.current = track;
    }
    if (this.player) {
      try {
        this.player.loop = true;
        this.player.volume = 0.4;
      } catch {
        // abaikan
      }
    }
    return this.player;
  }

  play(track: AmbientTrack) {
    if (!this.enabled) return;
    const p = this.ensurePlayer(track);
    try {
      p?.play?.();
    } catch {
      // abaikan
    }
  }

  pause() {
    try {
      this.player?.pause?.();
    } catch {
      // abaikan
    }
  }

  stop() {
    try {
      this.player?.pause?.();
    } catch {
      // abaikan
    }
  }

  setVolume(v: number) {
    try {
      if (this.player) this.player.volume = Math.min(Math.max(v, 0), 1);
    } catch {
      // abaikan
    }
  }
}

export const ambient = new AmbientService();
