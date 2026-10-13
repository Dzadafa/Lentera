import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { HeartPulseIcon, ShieldLockIcon, WindIcon, ChevronLeftIcon } from '../components/Icons';
import { useAppStore } from '../store/appStore';
import type { ScreenRoute } from '../navigation/routes';

interface Props {
  onNavigate: (route: ScreenRoute) => void;
  onQuickClose: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigate, onQuickClose }) => {
  const workMode = useAppStore((s) => s.workMode);
  const latest = useAppStore((s) => s.latestScreening);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <HeartPulseIcon size={18} color={colors.onPrimary} />
          </View>
          <Text style={styles.brandText}>{workMode ? 'Catatan Harian' : 'TautJiwa'}</Text>
        </View>
        <TouchableOpacity onPress={onQuickClose} style={styles.stealthBtn}>
          <Text style={styles.stealthLabel}>Mode Aman</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headline}>
        {workMode ? 'Catatan hari ini' : 'Kamu tidak perlu menjelaskan apa pun dulu.'}
      </Text>
      <Text style={styles.subheadline}>
        {workMode
          ? 'Tulis apa pun yang ingin kamu catat hari ini.'
          : 'Pilih satu langkah. Tidak ada akun, tidak ada data yang keluar dari perangkat ini.'}
      </Text>

      {/* PINTU 1 — Pertolongan instan */}
      <TouchableOpacity
        style={styles.doorPrimary}
        activeOpacity={0.88}
        onPress={() => onNavigate('calm')}
        accessibilityRole="button"
        accessibilityLabel="Aku sedang tidak baik sekarang, buka ruang tenang"
      >
        <View style={styles.doorPrimaryTop}>
          <View style={styles.doorIconCircle}>
            <WindIcon size={22} color={colors.primary} />
          </View>
          <View style={styles.doorTextGroup}>
            <Text style={styles.doorPrimaryTitle}>
              {workMode ? 'Mulai sesi fokus' : 'Aku sedang tidak baik sekarang'}
            </Text>
            <Text style={styles.doorPrimarySub}>
              {workMode ? 'Latihan pernapasan 1 menit' : 'Langsung dibantu bernapas. Tanpa satu pun pertanyaan.'}
            </Text>
          </View>
        </View>
        <View style={styles.doorBadgeRow}>
          <View style={styles.doorBadge}>
            <Text style={styles.doorBadgeText}>1 KETUK • 0 PERTANYAAN</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* PINTU 2 — Skrining */}
      <TouchableOpacity
        style={styles.doorSecondary}
        activeOpacity={0.88}
        onPress={() => onNavigate('quiz')}
        accessibilityRole="button"
        accessibilityLabel="Cek kondisi hatimu sekarang"
      >
        <View style={styles.doorSecondaryTop}>
          <View style={styles.doorIconCircleOutline}>
            <HeartPulseIcon size={20} color={colors.secondary} />
          </View>
          <View style={styles.doorTextGroup}>
            <Text style={styles.doorSecondaryTitle}>
              {workMode ? 'Isi catatan terstruktur' : 'Cek kondisi hatiku sekarang'}
            </Text>
            <Text style={styles.doorSecondarySub}>
              21 pertanyaan singkat • sekitar 3 menit • hasil langsung
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {latest && (
        <TouchableOpacity
          style={styles.lastResultCard}
          onPress={() => onNavigate('result')}
          activeOpacity={0.85}
        >
          <Text style={styles.lastResultLabel}>HASIL TERAKHIR</Text>
          <Text style={styles.lastResultValue}>
            {new Date(latest.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.lastResultSub}>Ketuk untuk membuka kembali ringkasan kamu</Text>
        </TouchableOpacity>
      )}

      <View style={styles.privacyRow}>
        <ShieldLockIcon size={16} color={colors.onSurfaceVariant} />
        <Text style={styles.privacyText}>
          Semua jawaban tersimpan hanya di perangkat ini. Tidak ada server, tidak ada akun.
        </Text>
      </View>

      <TouchableOpacity style={styles.settingsLink} onPress={() => onNavigate('settings')}>
        <Text style={styles.settingsLinkText}>Pengaturan & Mode Kerja</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: { ...typography.headlineMd, color: colors.primary },
  stealthBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  stealthLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  headline: { ...typography.displayLg, color: colors.onBackground, marginBottom: spacing.xs },
  subheadline: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  doorPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.gapCard,
  },
  doorPrimaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4 },
  doorIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorTextGroup: { flex: 1 },
  doorPrimaryTitle: { ...typography.headlineMd, color: colors.onPrimary },
  doorPrimarySub: { ...typography.bodySm, color: colors.primaryContainer, marginTop: 2 },
  doorBadgeRow: { marginTop: spacing.md, flexDirection: 'row' },
  doorBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  doorBadgeText: { ...typography.labelSm, color: colors.onPrimary, fontSize: 10 },
  doorSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  doorSecondaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4 },
  doorIconCircleOutline: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorSecondaryTitle: { ...typography.headlineMd, color: colors.onSurface },
  doorSecondarySub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  lastResultCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lastResultLabel: { ...typography.labelSm, color: colors.onPrimaryContainer },
  lastResultValue: { ...typography.headlineMd, color: colors.onPrimaryContainer, marginTop: 2 },
  lastResultSub: { ...typography.bodySm, color: colors.onPrimaryContainer, marginTop: 2 },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  privacyText: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
  settingsLink: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.sm },
  settingsLinkText: {
    ...typography.labelMd,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});
