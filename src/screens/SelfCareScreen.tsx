import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, SparkleIcon, WindIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { ToolkitDeck } from '../components/ToolkitDeck';
import { CbtReframeCard } from '../components/CbtReframeCard';
import { AmbientPlayer } from '../components/AmbientPlayer';
import { Reset60Flow } from '../components/Reset60Flow';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';

interface Props {
  onBack: () => void;
  onOpenCheckIn: () => void;
  onQuickClose: () => void;
}

type Tab = 'toolkit' | 'reframe' | 'reset';

/**
 * Kotak Pertolongan Mandiri (K1/K2/K3/H4/H6).
 * Menyatukan dek kartu teknik, uji ulang pikiran, dan reset enam puluh detik.
 */
export const SelfCareScreen: React.FC<Props> = ({ onBack, onOpenCheckIn, onQuickClose }) => {
  const [tab, setTab] = useState<Tab>('toolkit');
  const voiceGuide = useAppStore((s) => s.voiceGuide);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Kotak Pertolongan Mandiri</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Kumpulan teknik praktis yang bisa dicoba dalam hitungan menit. Semuanya bekerja tanpa
          internet dan tanpa akun.
        </Text>

        <TouchableOpacity style={styles.checkinBanner} onPress={onOpenCheckIn} activeOpacity={0.88}>
          <Text style={styles.checkinBannerTitle}>Belum mencatat energi hari ini?</Text>
          <Text style={styles.checkinBannerSub}>Satu ketukan sudah cukup, data tetap lokal</Text>
        </TouchableOpacity>

        <View style={styles.tabBar}>
          {(
            [
              { id: 'toolkit', label: 'Kotak P3K' },
              { id: 'reframe', label: 'Uji Pikiran' },
              { id: 'reset', label: 'Reset 60 Detik' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              onPress={() => {
                void haptics.tap();
                setTab(t.id);
              }}
            >
              <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'toolkit' && (
          <View>
            <ToolkitDeck />
            <AmbientPlayer />
          </View>
        )}

        {tab === 'reframe' && <CbtReframeCard />}

        {tab === 'reset' && <Reset60Flow voiceGuide={voiceGuide} />}

        <View style={styles.footerNote}>
          <SparkleIcon size={16} color={colors.tertiary} />
          <Text style={styles.footerNoteText}>
            Kalau teknik ini tidak cukup, buka Teman Cerita untuk menjangkau pendamping terlatih.
          </Text>
        </View>
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
  topTitle: { ...typography.headlineMd, color: colors.primary, flexShrink: 1 },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  checkinBanner: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checkinBannerTitle: { ...typography.labelLg, color: colors.onPrimaryContainer },
  checkinBannerSub: { ...typography.bodySm, color: colors.onPrimaryContainer, marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.full },
  tabBtnActive: { backgroundColor: colors.surface },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { color: colors.primary },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.md,
  },
  footerNoteText: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
});
