import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { ScreeningDisclaimer } from '../components/ScreeningDisclaimer';
import { DassTrendChart } from '../components/DassTrendChart';
import { getScreeningTrend } from '../db';
import type { ScreeningTrendPoint } from '../types/dass_trend';

interface Props {
  onBack: () => void;
  onOpenQuiz: () => void;
  onQuickClose: () => void;
}

const TIER_LABEL: Record<string, string> = {
  low: 'Rendah',
  moderate: 'Sedang',
  high: 'Tinggi',
};

/**
 * Riwayat dan Tren (C5).
 * Seluruh titik data berasal dari basis data lokal; tidak ada pengiriman ke luar.
 */
export const TrendScreen: React.FC<Props> = ({ onBack, onOpenQuiz, onQuickClose }) => {
  const [points, setPoints] = useState<ScreeningTrendPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      setPoints(await getScreeningTrend(12));
      setLoaded(true);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Riwayat & Tren</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loaded && points.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
            <Text style={styles.emptyBody}>
              Setelah kamu menyelesaikan skrining, arah perubahan skormu akan muncul di sini. Data
              ini hanya tersimpan di perangkatmu.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onOpenQuiz} activeOpacity={0.88}>
              <Text style={styles.emptyBtnText}>Mulai skrining sekarang</Text>
            </TouchableOpacity>
          </View>
        )}

        {points.length > 0 && (
          <View>
            <DassTrendChart points={points} />
            <ScreeningDisclaimer condensed />
            <Text style={styles.sectionTitle}>Riwayat Skrining</Text>
            {points
              .slice()
              .reverse()
              .map((p) => (
                <View key={p.id} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowDate}>
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.rowTier}>Kondisi {TIER_LABEL[p.tier] ?? p.tier}</Text>
                  </View>
                  <Text style={styles.rowScores}>
                    D {p.depression} • C {p.anxiety} • S {p.stress}
                  </Text>
                </View>
              ))}
            <Text style={styles.footnote}>
              D berarti depresi, C berarti kecemasan, S berarti stres. Angka ini adalah skor
              skrining, bukan diagnosis.
            </Text>
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
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyTitle: { ...typography.headlineMd, color: colors.primary, marginBottom: spacing.xs },
  emptyBody: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  emptyBtnText: { ...typography.labelMd, color: colors.onPrimary },
  sectionTitle: { ...typography.headlineMd, color: colors.primary, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  rowLeft: { flex: 1 },
  rowDate: { ...typography.labelLg, color: colors.onSurface },
  rowTier: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  rowScores: { ...typography.labelMd, color: colors.primary },
  footnote: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: spacing.sm },
});
