import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, DocumentIcon, SparkleIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { ScreeningDisclaimer } from '../components/ScreeningDisclaimer';
import { useAppStore } from '../store/appStore';
import { formatSeverityLabel } from '../services/scoring';
import { generateAndSharePdfSummary } from '../services/pdfSummary';
import { PSYCHOED_CARDS } from '../content/psychoed';
import { PLAN_7_DAY } from '../content/plan7day';
import type { DimensionScore, Tier } from '../types/domain';

interface Props {
  onBack: () => void;
  onOpenReferral: () => void;
  onOpenCheckIn: () => void;
  onOpenSelfCare: () => void;
  onOpenBurnout: () => void;
  onOpenStories: () => void;
  onOpenSupport: () => void;
  onOpenTrend: () => void;
  onQuickClose: () => void;
}

const TIER_STYLES: Record<
  Tier,
  { bg: string; fg: string; label: string; framing: string }
> = {
  low: {
    bg: colors.tierLowContainer,
    fg: colors.onTierLowContainer,
    label: 'Kondisi Rendah',
    framing: 'Skor kamu rendah — bukan berarti kamu harus mempertahankannya sendirian.',
  },
  moderate: {
    bg: colors.tierModerateContainer,
    fg: colors.onTierModerateContainer,
    label: 'Kondisi Sedang',
    framing: 'Skor kamu sedang. Kondisi ini bisa membaik dengan langkah kecil yang konsisten.',
  },
  high: {
    bg: colors.tierHighContainer,
    fg: colors.onTierHighContainer,
    label: 'Kondisi Tinggi',
    framing: 'Skor kamu tinggi. Ada langkah konkret yang bisa diambil hari ini — dan kamu tidak harus menghadapinya sendiri.',
  },
};

const DimensionRow: React.FC<{ title: string; data: DimensionScore }> = ({ title, data }) => (
  <View style={styles.dimensionRow}>
    <Text style={styles.dimensionTitle}>{title}</Text>
    <View style={styles.dimensionRight}>
      <Text style={styles.dimensionScore}>{data.score}</Text>
      <Text style={styles.dimensionSeverity}>{formatSeverityLabel(data.severity)}</Text>
    </View>
  </View>
);

export const ResultScreen: React.FC<Props> = ({
  onBack,
  onOpenReferral,
  onOpenCheckIn,
  onOpenSelfCare,
  onOpenBurnout,
  onOpenStories,
  onOpenSupport,
  onOpenTrend,
  onQuickClose,
}) => {
  const result = useAppStore((s) => s.latestScreening);
  const [isExporting, setIsExporting] = useState(false);

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Hasil Skrining</Text>
          <QuickCloseButton onPress={onQuickClose} label="" />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Belum ada hasil skrining</Text>
          <Text style={styles.emptyBody}>
            Selesaikan 21 pertanyaan skrining untuk melihat ringkasan kondisi kamu di sini.
          </Text>
          <TouchableOpacity style={styles.emptyCtaBtn} onPress={onBack} activeOpacity={0.88}>
            <Text style={styles.emptyCtaText}>Mulai skrining sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const tierStyle = TIER_STYLES[result.tier];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateAndSharePdfSummary(result);
    } catch {
      Alert.alert(
        'Surat tidak bisa dibuat',
        'PDF gagal dibuat karena penyimpanan perangkat mungkin penuh, atau ada izin yang belum diberikan. Coba periksa ruang penyimpanan dan ulangi.',
        [{ text: 'Tutup' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Hasil Skrining</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {result.tier === 'high' && (
          <View style={styles.safetyBanner}>
            <Text style={styles.safetyBannerText}>
              KESELAMATAN DULU — kalau kamu merasa dalam bahaya, hubungi 119 ekstensi 8 sekarang.
            </Text>
          </View>
        )}

        <View style={[styles.tierCard, { backgroundColor: tierStyle.bg }]}>
          <Text style={[styles.tierLabel, { color: tierStyle.fg }]}>{tierStyle.label}</Text>
          <Text style={[styles.tierFraming, { color: tierStyle.fg }]}>{tierStyle.framing}</Text>
        </View>

        <ScreeningDisclaimer />

        {result.tiered ? (
          <View style={styles.scoresCard}>
            <View style={styles.tieredHeaderRow}>
              <Text style={styles.scoresTitle}>Skrining Bertingkat</Text>
              <View style={styles.k10Badge}>
                <Text style={styles.k10BadgeText}>
                  K-10: {result.tiered.k10Score}/50
                </Text>
              </View>
            </View>

            <View style={styles.k10SummaryBox}>
              <Text style={styles.k10SummaryTitle}>K-10 (Distres Psikologis Global)</Text>
              <Text style={styles.k10SummaryDesc}>
                Skor {result.tiered.k10Score} dari 50 •{' '}
                {result.tiered.k10Score >= 25
                  ? 'Terindikasi distres tinggi (≥ 25)'
                  : 'Distres dalam batas ringan/normal'}
              </Text>
            </View>

            {result.tiered.openedDeepScreening ? (
              <View style={{ marginTop: spacing.sm }}>
                <Text style={styles.subScoresTitle}>
                  Hasil Skrining Spesifik Lanjutan
                </Text>
                <View style={styles.dimensionRow}>
                  <Text style={styles.dimensionTitle}>Depresi (PHQ-9)</Text>
                  <View style={styles.dimensionRight}>
                    <Text style={styles.dimensionScore}>{result.tiered.phq9Score ?? result.depression.score}/27</Text>
                    <Text style={styles.dimensionSeverity}>{formatSeverityLabel(result.depression.severity)}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.dimensionRow}>
                  <Text style={styles.dimensionTitle}>Kecemasan (GAD-7)</Text>
                  <View style={styles.dimensionRight}>
                    <Text style={styles.dimensionScore}>{result.tiered.gad7Score ?? result.anxiety.score}/21</Text>
                    <Text style={styles.dimensionSeverity}>{formatSeverityLabel(result.anxiety.severity)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.k10SafeNotice}>
                <SparkleIcon size={16} color={colors.primary} />
                <Text style={styles.k10SafeNoticeText}>
                  Skor K-10 di bawah ambang batas distres tinggi (25). Skrining lanjutan tidak diperlukan.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.scoresCard}>
            <Text style={styles.scoresTitle}>Skor Tiga Dimensi</Text>
            <DimensionRow title="Depresi" data={result.depression} />
            <View style={styles.divider} />
            <DimensionRow title="Kecemasan" data={result.anxiety} />
            <View style={styles.divider} />
            <DimensionRow title="Stres" data={result.stress} />
          </View>
        )}

        {/* CTA utama — tepat satu, sesuai tier */}
        {result.tier === 'low' && (
          <TouchableOpacity style={styles.primaryCta} onPress={onOpenCheckIn} activeOpacity={0.88}>
            <Text style={styles.primaryCtaText}>Mulai Cek-in Harian</Text>
          </TouchableOpacity>
        )}

        {result.tier === 'moderate' && (
          <View>
            <Text style={styles.sectionTitle}>Rencana 7 Hari</Text>
            <View style={styles.planCard}>
              {PLAN_7_DAY.map((d) => (
                <View key={d.day} style={styles.planRow}>
                  <View style={styles.planDayBadge}>
                    <Text style={styles.planDayText}>{d.day}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{d.title}</Text>
                    <Text style={styles.planAction}>{d.action}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryCta} onPress={onOpenCheckIn} activeOpacity={0.88}>
              <Text style={styles.primaryCtaText}>Mulai Rencana & Catat Energi</Text>
            </TouchableOpacity>
          </View>
        )}

        {result.tier === 'high' && (
          <TouchableOpacity style={styles.primaryCta} onPress={onOpenReferral} activeOpacity={0.88}>
            <Text style={styles.primaryCtaText}>Mulai Panduan ke Puskesmas</Text>
          </TouchableOpacity>
        )}

        {/* CTA sekunder — hanya untuk tier akut, sesuai desain */}
        {result.tier === 'high' && (
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.85}
          >
            {isExporting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <DocumentIcon size={18} color={colors.primary} />
                <Text style={styles.secondaryCtaText}>
                  Unduh Surat Ringkasan Gejala (PDF)
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {result.tier === 'moderate' && (
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.85}
          >
            {isExporting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <DocumentIcon size={18} color={colors.primary} />
                <Text style={styles.secondaryCtaText}>Unduh Ringkasan Gejala (PDF)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Ruang pendukung per tier. CTA utama tetap tepat satu di atas. */}
        {result.tier === 'low' && (
          <View>
            <Text style={styles.sectionTitle}>Jaga supaya tetap di sini</Text>
            <View style={styles.linkGroup}>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenSelfCare}>
                <Text style={styles.linkText}>Kotak Pertolongan Mandiri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenTrend}>
                <Text style={styles.linkText}>Riwayat & tren skor</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {result.tier === 'moderate' && (
          <View>
            <Text style={styles.sectionTitle}>Langkah pendukung</Text>
            <View style={styles.linkGroup}>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenSelfCare}>
                <Text style={styles.linkText}>Kotak Pertolongan Mandiri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenBurnout}>
                <Text style={styles.linkText}>Latihan bicara & ritual tutup hari</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenStories}>
                <Text style={styles.linkText}>Dinding Cerita: dari kondisi sedang</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenSupport}>
                <Text style={styles.linkText}>Direktori konseling kampus dan EAP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenTrend}>
                <Text style={styles.linkText}>Riwayat & tren skor</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {result.tier === 'high' && (
          <View>
            <Text style={styles.sectionTitle}>Kamu tidak sendirian</Text>
            <View style={styles.linkGroup}>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenStories}>
                <Text style={styles.linkText}>Dinding Cerita: pernah kondisi tinggi, kini membaik</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={onOpenSupport}>
                <Text style={styles.linkText}>Hotline dan layanan pendamping</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Psikoedukasi — disembunyikan pada tier akut */}
        {result.tier !== 'high' && (
          <View>
            <Text style={styles.sectionTitle}>Yang perlu kamu tahu</Text>
            {PSYCHOED_CARDS.filter((c) => c.tier === result.tier || result.tier === 'moderate').map(
              (c) => (
                <View key={c.id} style={styles.psychoCard}>
                  <SparkleIcon size={16} color={colors.tertiary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.psychoTitle}>{c.title}</Text>
                    <Text style={styles.psychoBody}>{c.body}</Text>
                  </View>
                </View>
              )
            )}
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
  safetyBanner: {
    backgroundColor: colors.crisisContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.crisis,
    marginBottom: spacing.md,
  },
  safetyBannerText: { ...typography.labelMd, color: colors.onCrisisContainer },
  tierCard: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  tierLabel: { ...typography.labelSm },
  tierFraming: { ...typography.headlineMd, marginTop: spacing.xs },
  scoresCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  tieredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  k10Badge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.chip,
  },
  k10BadgeText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  k10SummaryBox: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
  },
  k10SummaryTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  k10SummaryDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  subScoresTitle: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  k10SafeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  k10SafeNoticeText: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    flex: 1,
  },
  scoresTitle: { ...typography.labelLg, color: colors.primary, marginBottom: spacing.sm },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dimensionTitle: { ...typography.bodyLg, color: colors.onSurface },
  dimensionRight: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  dimensionScore: { ...typography.headlineMd, color: colors.primary },
  dimensionSeverity: { ...typography.bodySm, color: colors.onSurfaceVariant },
  divider: { height: 1, backgroundColor: colors.outlineVariant },
  primaryCta: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryCtaText: { ...typography.labelLg, color: '#FFFFFF' },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    height: 50,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  secondaryCtaText: { ...typography.labelMd, color: colors.primary },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.md,
  },
  planRow: { flexDirection: 'row', gap: spacing.sm + 4, alignItems: 'flex-start' },
  planDayBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDayText: { ...typography.labelSm, color: colors.onPrimaryContainer },
  planTitle: { ...typography.labelLg, color: colors.onSurface },
  planAction: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  linkGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  linkRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  linkText: { ...typography.labelMd, color: colors.secondary },
  psychoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  psychoTitle: { ...typography.labelLg, color: colors.onSurface },
  psychoBody: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.headlineMd, color: colors.primary, marginBottom: spacing.xs },
  emptyBody: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing.lg },
  emptyCtaBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCtaText: { ...typography.labelLg, color: colors.onPrimary },
});
