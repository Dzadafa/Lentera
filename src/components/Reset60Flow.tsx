import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { AFFIRMATIONS } from '../content/affirmations';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { SparkleIcon, WindIcon, CheckIcon } from './Icons';

type Phase = 'idle' | 'breath' | 'ground' | 'affirm' | 'done';

const PHASE_MS: Record<'breath' | 'ground' | 'affirm', number> = {
  breath: 20000,
  ground: 20000,
  affirm: 20000,
};

interface Props {
  voiceGuide?: boolean;
  onDone?: () => void;
}

/**
 * Reset 60 Detik (H6).
 * Alur terpandu otomatis tanpa isian: 20 detik napas, 20 detik menyentuh
 * kenyataan, 20 detik mengingat satu hal baik tentang diri sendiri.
 */
export const Reset60Flow: React.FC<Props> = ({ voiceGuide = false, onDone }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [affirmation] = useState(() => {
    const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
    return AFFIRMATIONS[idx];
  });
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    progressAnim.stopAnimation();
    void speech.stop();
  };

  useEffect(() => () => stopAll(), []);

  const runPhase = (next: 'breath' | 'ground' | 'affirm') => {
    setPhase(next);
    progressAnim.setValue(0);
    void haptics.tap();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: PHASE_MS[next],
      useNativeDriver: false,
    }).start();

    if (next === 'breath') {
      if (voiceGuide) {
        void speech.speak('Tarik napas panjang, lalu hembuskan perlahan. Biarkan bahumu turun.');
      }
      timerRef.current = setTimeout(() => runPhase('ground'), PHASE_MS.breath);
    } else if (next === 'ground') {
      if (voiceGuide) {
        void speech.speak('Rasakan telapak kakimu menapak ke lantai. Tubuhmu aman di tempat ini.');
      }
      timerRef.current = setTimeout(() => runPhase('affirm'), PHASE_MS.ground);
    } else {
      if (voiceGuide) {
        void speech.speak(affirmation.text);
      }
      timerRef.current = setTimeout(() => {
        setPhase('done');
        void haptics.success();
        onDone?.();
      }, PHASE_MS.affirm);
    }
  };

  const cancel = () => {
    stopAll();
    setPhase('idle');
  };

  if (phase === 'idle') {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <SparkleIcon size={18} color={colors.tertiary} />
          <Text style={styles.title}>Reset 60 Detik</Text>
        </View>
        <Text style={styles.sub}>
          Satu menit terpandu tanpa isian: dua puluh detik napas dalam, dua puluh detik menyentuh
          kenyataan, dan dua puluh detik mengingat satu hal baik tentang dirimu.
        </Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => runPhase('breath')}
          activeOpacity={0.88}
        >
          <WindIcon size={18} color={colors.onPrimary} />
          <Text style={styles.startBtnText}>Mulai Reset 60 Detik</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View style={[styles.card, styles.doneCard]}>
        <View style={styles.doneIcon}>
          <CheckIcon size={22} color={colors.tertiary} />
        </View>
        <Text style={styles.doneTitle}>Selesai.</Text>
        <Text style={styles.doneBody}>
          Satu menit sudah cukup untuk memberi jeda pada sistem sarafmu. Kamu boleh kembali ke
          aktivitasmu kapan pun kamu siap.
        </Text>
        <TouchableOpacity style={styles.restartBtn} onPress={() => setPhase('idle')}>
          <Text style={styles.restartBtnText}>Tutup atau ulangi nanti</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SparkleIcon size={18} color={colors.tertiary} />
        <Text style={styles.title}>
          {phase === 'breath'
            ? 'Fase 1 dari 3: Napas Dalam'
            : phase === 'ground'
            ? 'Fase 2 dari 3: Sentuh Lantai'
            : 'Fase 3 dari 3: Afirmasi'}
        </Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      {phase === 'breath' && (
        <View style={styles.bodyBox}>
          <Text style={styles.phaseHeading}>Tarik napas panjang, hembuskan perlahan.</Text>
          <Text style={styles.phaseBody}>
            Lepaskan ketegangan di rahang dan bahumu. Tidak perlu mengatur ritme yang kaku.
          </Text>
        </View>
      )}

      {phase === 'ground' && (
        <View style={styles.bodyBox}>
          <Text style={styles.phaseHeading}>Rasakan telapak kakimu menapak ke lantai.</Text>
          <Text style={styles.phaseBody}>
            Tubuhmu ada di sini, di ruangan ini. Pikiranmu mungkin melayang, tapi ragamu berpijak
            dengan aman.
          </Text>
        </View>
      )}

      {phase === 'affirm' && (
        <View style={styles.bodyBox}>
          <Text style={styles.phaseHeading}>{affirmation.text}</Text>
          <Text style={styles.phaseBody}>{affirmation.context}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
        <Text style={styles.cancelBtnText}>Hentikan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { ...typography.labelLg, color: colors.primary, flex: 1 },
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
  },
  startBtnText: { ...typography.labelMd, color: colors.onPrimary },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  barFill: { height: 4, backgroundColor: colors.tertiary },
  bodyBox: { paddingVertical: spacing.md, minHeight: 90, justifyContent: 'center' },
  phaseHeading: { ...typography.headlineMd, color: colors.onSurface, marginBottom: 6 },
  phaseBody: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelBtnText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
  doneCard: {
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderColor: colors.tertiary,
  },
  doneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  doneTitle: { ...typography.headlineMd, color: colors.onTertiaryContainer, marginBottom: 4 },
  doneBody: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
  },
  restartBtn: { marginTop: spacing.md, paddingVertical: spacing.sm },
  restartBtnText: {
    ...typography.labelMd,
    color: colors.onTertiaryContainer,
    textDecorationLine: 'underline',
  },
});
