import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { useAppStore } from '../store/appStore';
import { EMERGENCY_CONTACT } from '../content/referral';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const workMode = useAppStore((s) => s.workMode);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleWorkMode = useAppStore((s) => s.toggleWorkMode);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const voiceGuide = useAppStore((s) => s.voiceGuide);
  const toggleVoiceGuide = useAppStore((s) => s.toggleVoiceGuide);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Pengaturan</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupLabel}>PRIVASI</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Mode Kerja</Text>
              <Text style={styles.rowSub}>
                Ubah tampilan menjadi seperti aplikasi catatan biasa. Kata bermuatan mental disembunyikan.
              </Text>
            </View>
            <Switch
              value={workMode}
              onValueChange={toggleWorkMode}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.groupLabel}>PERANGKAT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Getaran Napas</Text>
              <Text style={styles.rowSub}>
                Perangkat bergetar mengikuti irama napas. Bisa dimatikan bila mengganggu.
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Mode Suara</Text>
              <Text style={styles.rowSub}>
                Perintah latihan dibacakan dengan suara, jadi kamu bisa menutup mata dan hanya
                mengikuti panduan. Memakai mesin suara bawaan perangkat, tanpa internet.
              </Text>
            </View>
            <Switch
              value={voiceGuide}
              onValueChange={toggleVoiceGuide}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.groupLabel}>BANTUAN DARURAT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{EMERGENCY_CONTACT.label}</Text>
              <Text style={styles.rowSub}>Nomor {EMERGENCY_CONTACT.display} siap dihubungi kapan saja.</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tentang Data Kamu</Text>
          <Text style={styles.infoBody}>
            TautJiwa tidak memiliki server dan tidak meminta akun. Seluruh jawaban skrining, catatan harian, dan pengaturan tersimpan di basis data lokal perangkat ini. Menghapus aplikasi akan menghapus seluruh data.
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
  content: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  groupLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, marginTop: spacing.md, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: spacing.md },
  rowText: { flex: 1 },
  rowTitle: { ...typography.labelLg, color: colors.onSurface },
  rowSub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoTitle: { ...typography.labelLg, color: colors.onPrimaryContainer, marginBottom: 4 },
  infoBody: { ...typography.bodySm, color: colors.onPrimaryContainer, lineHeight: 18 },
});
