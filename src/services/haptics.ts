import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Wrapper haptik dengan silent fallback bila tidak didukung.
 */
class HapticsService {
  private enabled: boolean = true;

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async breathPhase(phase: 'inhale' | 'hold' | 'exhale') {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'android') {
        switch (phase) {
          case 'inhale':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'hold':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'exhale':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Perangkat tanpa motor getar — silent fallback
    }
  }

  async tap() {
    if (!this.enabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
  }

  async success() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
  }

  async alert() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // ignore
    }
  }
}

export const haptics = new HapticsService();
