import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { haptics } from '../services/haptics';
import { BurnAnimation } from './BurnAnimation';
import { FlameIcon, SparkleIcon } from './Icons';

type Phase = 'write' | 'burn' | 'released';

/**
 * Tulis & Lepaskan.
 *
 * Menulis beban pikiran lalu membakarnya secara visual. Teks tidak pernah
 * disimpan, tidak pernah dikirim, dan dihapus dari memori begitu animasi selesai.
 */
export const ThoughtShredder: React.FC = () => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('write');
  const [burned, setBurned] = useState('');

  const handleBurn = () => {
    const value = text.trim();
    if (!value) return;
    haptics.burn();
    setBurned(value);
    setPhase('burn');
  };

  const handleBurnDone = () => {
    setText('');
    setBurned('');
    setPhase('released');
    haptics.success();
    setTimeout(() => setPhase('write'), 2600);
  };

  if (phase === 'burn') {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <FlameIcon size={18} color={colors.tierModerate} />
          <Text style={styles.title}>Membakar &amp; Melepaskan</Text>
        </View>
        <BurnAnimation text={burned} onDone={handleBurnDone} />
        <Text style={styles.note}>
          Teks ini tidak disimpan di mana pun. Begitu terbakar, isinya hilang dari memori perangkat.
        </Text>
      </View>
    );
  }

  if (phase === 'released') {
    return (
      <View style={[styles.card, styles.releasedCard]}>
        <View style={styles.releasedIcon}>
          <SparkleIcon size={22} color={colors.tertiary} />
        </View>
        <Text style={styles.releasedTitle}>Sudah lepas.</Text>
        <Text style={styles.releasedBody}>
          Kamu baru saja memberi jarak antara dirimu dan pikiran itu. Tidak ada yang tersimpan — tidak
          ada yang perlu kamu jelaskan ke siapa pun.
        </Text>
        <Text style={styles.releasedHint}>
          Kalau pikiran itu datang lagi, kamu boleh kembali ke sini kapan saja.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <FlameIcon size={18} color={colors.tierModerate} />
        <Text style={styles.title}>Tulis &amp; Lepaskan</Text>
      </View>
      <Text style={styles.sub}>
        Tulis pikiran yang membebani kamu sekarang. Setelah ditekan, tulisan ini dibakar dan hilang
        permanen tanpa pernah disimpan.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Ketik unek-unek atau beban pikiranmu di sini…"
        placeholderTextColor={colors.onSurfaceVariant}
        value={text}
        onChangeText={setText}
        maxLength={420}
      />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Tidak disimpan • tidak dikirim</Text>
        <Text style={styles.metaText}>{text.trim().length}/420</Text>
      </View>

      <TouchableOpacity
        style={[styles.burnBtn, !text.trim() && styles.burnBtnDisabled]}
        disabled={!text.trim()}
        onPress={handleBurn}
        activeOpacity={0.85}
      >
        <FlameIcon size={18} color="#FFFFFF" />
        <Text style={styles.burnLabel}>Bakar &amp; Lepaskan</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { ...typography.labelLg, color: colors.primary },
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    minHeight: 110,
    textAlignVertical: 'top',
    ...typography.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  metaText: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant },
  burnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
  },
  burnBtnDisabled: { opacity: 0.4 },
  burnLabel: { ...typography.labelMd, color: '#FFFFFF' },
  note: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant, textAlign: 'center' },
  releasedCard: {
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderColor: colors.tertiary,
    paddingVertical: spacing.lg,
  },
  releasedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  releasedTitle: { ...typography.headlineMd, color: colors.onTertiaryContainer, marginBottom: 6 },
  releasedBody: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
    lineHeight: 21,
  },
  releasedHint: {
    ...typography.bodySm,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
    marginTop: spacing.sm,
    opacity: 0.85,
  },
});
