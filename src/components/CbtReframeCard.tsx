import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { CBT_REFRAMES } from '../content/toolkit';
import { haptics } from '../services/haptics';
import { SparkleIcon } from './Icons';

/**
 * Reframe Pikiran (K3).
 * Membantu memeriksa pikiran otomatis dengan template pertanyaan. Teks yang
 * ditulis tidak disimpan ke basis data mana pun.
 */
export const CbtReframeCard: React.FC = () => {
  const [selectedId, setSelectedId] = useState(CBT_REFRAMES[0].id);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('');
  const current = CBT_REFRAMES.find((t) => t.id === selectedId) ?? CBT_REFRAMES[0];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SparkleIcon size={18} color={colors.secondary} />
        <Text style={styles.title}>Uji Ulang Pikiran</Text>
      </View>
      <Text style={styles.sub}>
        Pikiran otomatis sering terasa seperti fakta, padahal belum tentu benar. Pilih satu cara
        pandang untuk mengujinya. Teks ini tidak disimpan di mana pun.
      </Text>

      <View style={styles.tabRow}>
        {CBT_REFRAMES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, t.id === selectedId && styles.tabActive]}
            onPress={() => {
              void haptics.tap();
              setSelectedId(t.id);
            }}
          >
            <Text style={[styles.tabText, t.id === selectedId && styles.tabTextActive]}>
              {t.trap}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.trapBox}>
        <Text style={styles.trapLabel}>POLA PIKIR</Text>
        <Text style={styles.trapTitle}>{current.explanation}</Text>
      </View>

      <Text style={styles.prompt}>{current.challengeQuestion}</Text>

      <TextInput
        style={styles.input}
        placeholder="Tulis pikiran yang sedang membebanimu..."
        placeholderTextColor={colors.onSurfaceVariant}
        value={input}
        onChangeText={setInput}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Tulis sudut pandang alternatif yang lebih adil..."
        placeholderTextColor={colors.onSurfaceVariant}
        value={answer}
        onChangeText={setAnswer}
        multiline
      />

      <View style={styles.exampleBox}>
        <Text style={styles.exampleLabel}>CONTOH SEBELUM</Text>
        <Text style={styles.exampleText}>{current.exampleOriginal}</Text>
        <Text style={[styles.exampleLabel, styles.exampleLabelAfter]}>CONTOH SESUDAH</Text>
        <Text style={styles.exampleText}>{current.exampleReframed}</Text>
      </View>

      {(input.length > 0 || answer.length > 0) && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            void haptics.tap();
            setInput('');
            setAnswer('');
          }}
        >
          <Text style={styles.clearBtnText}>Bersihkan formulir</Text>
        </TouchableOpacity>
      )}
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
  title: { ...typography.labelLg, color: colors.primary },
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  tabRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: spacing.md },
  tab: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  tabActive: { backgroundColor: colors.secondaryContainer },
  tabText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabTextActive: { color: colors.onSecondaryContainer },
  trapBox: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  trapLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  trapTitle: { ...typography.bodyMd, color: colors.onSurface, marginTop: 2 },
  prompt: { ...typography.headlineMd, color: colors.primary, marginVertical: spacing.sm },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    minHeight: 70,
    textAlignVertical: 'top',
    ...typography.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  exampleBox: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    marginTop: 4,
  },
  exampleLabel: { ...typography.labelSm, color: colors.onPrimaryContainer },
  exampleLabelAfter: { marginTop: spacing.sm },
  exampleText: { ...typography.bodySm, color: colors.onPrimaryContainer, marginTop: 2 },
  clearBtn: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  clearBtnText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
});
