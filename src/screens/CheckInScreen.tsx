import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { useAppStore } from '../store/appStore';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

export const CheckInScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [saved, setSaved] = useState(false);
  const saveCheckIn = useAppStore((s) => s.saveTodayCheckIn);
  const recent = useAppStore((s) => s.recentCheckIns);

  const handleSave = async () => {
    await saveCheckIn(mood, energy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ScaleRow: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
  }> = ({ label, value, onChange }) => (
    <View style={styles.scaleBlock}>
      <Text style={styles.scaleLabel}>{label}</Text>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.scaleDot, value === n && styles.scaleDotActive]}
            onPress={() => onChange(n)}
            activeOpacity={0.85}
          >
            <Text style={[styles.scaleDotText, value === n && styles.scaleDotTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Cek-in Harian</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Bagaimana hari ini?</Text>
        <Text style={styles.sub}>
          Satu ketukan sudah cukup. Catatan ini hanya tersimpan di perangkat kamu.
        </Text>

        <View style={styles.card}>
          <ScaleRow label="Suasana hati" value={mood} onChange={setMood} />
          <View style={styles.divider} />
          <ScaleRow label="Tingkat energi" value={energy} onChange={setEnergy} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
          <Text style={styles.saveBtnText}>{saved ? 'Tersimpan' : 'Simpan Cek-in Hari Ini'}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Tujuh Hari Terakhir</Text>
        {recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada catatan</Text>
            <Text style={styles.emptyBody}>
              Setelah kamu menyimpan cek-in pertama, rangkaian harimu akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {recent.map((c) => (
              <View key={c.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{c.date}</Text>
                <Text style={styles.historyVal}>
                  Hati {c.mood}/5 • Energi {c.energy}/5
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary },
  content: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  headline: { ...typography.displayLg, color: colors.onBackground },
  sub: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  scaleBlock: { paddingVertical: spacing.sm },
  scaleLabel: { ...typography.labelLg, color: colors.onSurface, marginBottom: spacing.sm },
  scaleRow: { flexDirection: 'row', gap: spacing.sm },
  scaleDot: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  scaleDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  scaleDotText: { ...typography.labelLg, color: colors.onSurfaceVariant },
  scaleDotTextActive: { color: colors.onPrimary },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: spacing.sm },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: { ...typography.labelLg, color: '#FFFFFF' },
  sectionTitle: { ...typography.headlineMd, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  emptyTitle: { ...typography.labelLg, color: colors.onSurface },
  emptyBody: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { ...typography.bodySm, color: colors.onSurfaceVariant },
  historyVal: { ...typography.labelMd, color: colors.primary },
});
