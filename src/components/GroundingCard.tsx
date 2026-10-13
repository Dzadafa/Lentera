import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { GROUNDING_54321 } from '../content/crisis';
import { CheckIcon, SparkleIcon } from './Icons';
import { haptics } from '../services/haptics';

export const GroundingCard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const item = GROUNDING_54321[currentStep];

  const handleNext = () => {
    haptics.tap();
    if (currentStep < GROUNDING_54321.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
      haptics.success();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SparkleIcon size={18} color={colors.tertiary} />
        <Text style={styles.title}>Teknik Grounding 5-4-3-2-1</Text>
      </View>

      <Text style={styles.prompt}>{item.prompt}</Text>
      <Text style={styles.sub}>
        Fokuskan perhatian kamu pada lingkungan nyata sekarang. Jangan terburu-buru.
      </Text>

      <View style={styles.progressRow}>
        {GROUNDING_54321.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStep && styles.dotActive,
              i < currentStep && styles.dotDone,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.btnLabel}>
          {currentStep === GROUNDING_54321.length - 1 ? 'Selesai — Ulangi' : 'Sudah Ditemukan, Lanjut'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.labelLg,
    color: colors.primary,
  },
  prompt: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginVertical: spacing.xs,
  },
  sub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHigh,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotDone: {
    backgroundColor: colors.secondary,
  },
  btn: {
    backgroundColor: colors.primaryContainer,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLabel: {
    ...typography.labelMd,
    color: colors.onPrimaryContainer,
  },
});
