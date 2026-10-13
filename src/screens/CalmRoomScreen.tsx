import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, WindIcon, SparkleIcon } from '../components/Icons';
import { BreathingCircle } from '../components/BreathingCircle';
import { GroundingCard } from '../components/GroundingCard';
import { ThoughtShredder } from '../components/ThoughtShredder';
import { QuickCloseButton } from '../components/QuickCloseButton';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

type Tool = 'breath' | 'grounding' | 'release';

export const CalmRoomScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const [activeTool, setActiveTool] = useState<Tool>('breath');
  const [isBreathing, setIsBreathing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ruang Tenang</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Kamu sudah sampai di sini. Ambil posisi yang nyaman, lalu pilih satu latihan. Tidak ada yang perlu diselesaikan cepat.
        </Text>

        <View style={styles.toolTabs}>
          {([
            { id: 'breath', label: 'Napas' },
            { id: 'grounding', label: 'Grounding' },
            { id: 'release', label: 'Lepaskan' },
          ] as { id: Tool; label: string }[]).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolTab, activeTool === t.id && styles.toolTabActive]}
              onPress={() => setActiveTool(t.id)}
            >
              <Text style={[styles.toolTabText, activeTool === t.id && styles.toolTabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTool === 'breath' && (
          <View style={styles.breathSection}>
            <BreathingCircle pattern="box" isActive={isBreathing} />
            <TouchableOpacity
              style={[styles.primaryBtn, isBreathing && styles.primaryBtnStop]}
              onPress={() => setIsBreathing(!isBreathing)}
              activeOpacity={0.88}
            >
              <WindIcon size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                {isBreathing ? 'Hentikan Sesi' : 'Mulai Bernapas Bersama'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.hapticHint}>
              Perangkat akan bergetar lembut di setiap pergantian fase. Kamu boleh menutup mata dan tidak melihat layar.
            </Text>
          </View>
        )}

        {activeTool === 'grounding' && (
          <View>
            <GroundingCard />
          </View>
        )}

        {activeTool === 'release' && (
          <View>
            <ThoughtShredder />
          </View>
        )}

        <View style={styles.footerNote}>
          <SparkleIcon size={16} color={colors.tertiary} />
          <Text style={styles.footerNoteText}>
            Kalau kamu merasa dalam bahaya langsung, hubungi 119 ekstensi 8 atau 112 sekarang.
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
  topTitle: { ...typography.headlineMd, color: colors.primary },
  content: { paddingHorizontal: spacing.marginMobile, paddingBottom: spacing.xxl },
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  toolTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.lg,
  },
  toolTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  toolTabActive: { backgroundColor: colors.surface },
  toolTabText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  toolTabTextActive: { color: colors.primary },
  breathSection: { alignItems: 'center' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  primaryBtnStop: { backgroundColor: colors.secondary },
  primaryBtnText: { ...typography.labelLg, color: '#FFFFFF' },
  hapticHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.lg,
  },
  footerNoteText: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
});
