import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, PhoneAlertIcon, ShieldLockIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { COUNSELING_RESOURCES } from '../content/campusDirectory';
import { EMERGENCY_CONTACT } from '../content/referral';
import { haptics } from '../services/haptics';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

const GROUP_LABEL: Record<string, string> = {
  kampus: 'Lingkungan kampus',
  komunitas: 'Kerja dan komunitas',
  hotline: 'Hotline resmi',
};

/**
 * Teman Cerita dan Direktori Pendamping (I5/D11).
 *
 * Aplikasi tidak menjalankan server obrolan sendiri. Ruang chat anonim tanpa
 * tenaga terlatih dan tanpa verifikasi justru berisiko memperburuk kondisi
 * krisis. Layar ini mengarahkan ke konselor sebaya kampus, klinik kampus,
 * program bantuan karyawan, dan hotline resmi yang punya standar penanganan.
 */
export const PeerSupportScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const handleDial = () => {
    void haptics.alert();
    void Linking.openURL(EMERGENCY_CONTACT.tel);
  };

  const groups: Array<'kampus' | 'komunitas' | 'hotline'> = ['kampus', 'komunitas', 'hotline'];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Teman Cerita</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Kadang yang dibutuhkan hanya didengarkan tanpa dicap lemah. Berikut jalur pendamping yang
          bisa kamu akses dengan aman, dari yang paling ringan sampai rujukan penuh.
        </Text>

        <TouchableOpacity style={styles.hotlineCard} onPress={handleDial} activeOpacity={0.88}>
          <View style={styles.hotlineIcon}>
            <PhoneAlertIcon size={22} color={colors.crisis} />
          </View>
          <View style={styles.hotlineBody}>
            <Text style={styles.hotlineTitle}>{EMERGENCY_CONTACT.label}</Text>
            <Text style={styles.hotlineSub}>
              Tekan {EMERGENCY_CONTACT.display} • bebas pulsa, siaga dua puluh empat jam
            </Text>
          </View>
        </TouchableOpacity>

        {groups.map((g) => (
          <View key={g}>
            <Text style={styles.groupLabel}>{GROUP_LABEL[g].toUpperCase()}</Text>
            {COUNSELING_RESOURCES.filter((r) => r.category === g).map((r) => (
              <View key={r.id} style={styles.serviceCard}>
                <View style={styles.serviceTop}>
                  <Text style={styles.serviceName}>{r.name}</Text>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>{r.cost}</Text>
                  </View>
                </View>
                <Text style={styles.serviceTagline}>{r.tagline}</Text>
                <Text style={styles.serviceOffer}>{r.note}</Text>
                <View style={styles.startBox}>
                  <Text style={styles.startLabel}>CARA MULAI</Text>
                  <Text style={styles.startText}>{r.channel}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.privacyNote}>
          <View style={styles.privacyHeader}>
            <ShieldLockIcon size={16} color={colors.primary} />
            <Text style={styles.privacyTitle}>Kenapa tidak ada obrolan anonim di sini?</Text>
          </View>
          <Text style={styles.privacyBody}>
            Ruang obrolan anonim tanpa tenaga terlatih sulit dijaga dan berisiko memperburuk kondisi
            krisis. Aplikasi ini mengarahkanmu ke pendamping terlatih dan layanan resmi yang punya
            kewajiban menjaga kerahasiaanmu.
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
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  hotlineCard: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    backgroundColor: colors.crisisContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.crisis,
    marginBottom: spacing.lg,
  },
  hotlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotlineBody: { flex: 1 },
  hotlineTitle: { ...typography.headlineMd, color: colors.onCrisisContainer },
  hotlineSub: { ...typography.bodySm, color: colors.onCrisisContainer, marginTop: 2 },
  groupLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  serviceName: { ...typography.labelLg, color: colors.onSurface, flex: 1 },
  costBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  costText: { ...typography.labelSm, color: colors.onPrimaryContainer },
  serviceTagline: { ...typography.bodySm, color: colors.secondary, marginTop: 2 },
  serviceOffer: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginVertical: spacing.xs,
  },
  startBox: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  startLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  startText: { ...typography.bodySm, color: colors.onSurface, marginTop: 2 },
  privacyNote: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  privacyTitle: { ...typography.labelMd, color: colors.primary, flex: 1 },
  privacyBody: { ...typography.bodySm, color: colors.onSurfaceVariant },
});
