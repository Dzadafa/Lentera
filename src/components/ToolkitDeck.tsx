import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { TOOLKIT_CARDS } from '../content/toolkit';
import { haptics } from '../services/haptics';
import { SparkleIcon } from './Icons';

const CATEGORY_LABEL: Record<string, string> = {
  tubuh: 'Tubuh',
  pikiran: 'Pikiran',
  lingkungan: 'Lingkungan',
};

/** Dek Kartu Toolkit (K2) — kotak P3K emosi, satu teknik per kartu. */
export const ToolkitDeck: React.FC = () => {
  const [index, setIndex] = useState(0);
  const card = TOOLKIT_CARDS[index];

  const move = (delta: number) => {
    void haptics.tap();
    setIndex((i) => (i + delta + TOOLKIT_CARDS.length) % TOOLKIT_CARDS.length);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SparkleIcon size={18} color={colors.tertiary} />
        <Text style={styles.title}>Kotak P3K Emosi</Text>
        <Text style={styles.counter}>
          {index + 1} / {TOOLKIT_CARDS.length}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{CATEGORY_LABEL[card.category].toUpperCase()}</Text>
        </View>
        <Text style={styles.durationText}>{card.duration}</Text>
      </View>

      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.summary}>{card.summary}</Text>

      <View style={styles.stepList}>
        {card.steps.map((st, i) => (
          <View key={st} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{st}</Text>
          </View>
        ))}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => move(-1)}
          accessibilityLabel="Kartu sebelumnya"
        >
          <Text style={styles.navBtnText}>Sebelumnya</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary]}
          onPress={() => move(1)}
          accessibilityLabel="Kartu berikutnya"
        >
          <Text style={styles.navBtnTextPrimary}>Teknik Lainnya</Text>
        </TouchableOpacity>
      </View>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  title: { ...typography.labelLg, color: colors.primary, flex: 1 },
  counter: { ...typography.bodySm, color: colors.onSurfaceVariant },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  catBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  catBadgeText: { ...typography.labelSm, color: colors.onPrimaryContainer },
  durationText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  cardTitle: { ...typography.headlineMd, color: colors.onSurface, marginTop: 4, marginBottom: 4 },
  summary: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  stepList: { gap: spacing.sm, marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: { ...typography.labelSm, color: colors.primary },
  stepText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  navRow: { flexDirection: 'row', gap: spacing.sm },
  navBtn: {
    flex: 1,
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navBtnText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  navBtnTextPrimary: { ...typography.labelMd, color: colors.onPrimary },
});
