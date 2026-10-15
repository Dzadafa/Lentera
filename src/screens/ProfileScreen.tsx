import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../theme';
import {
  ChevronLeftIcon,
  ShieldLockIcon,
  SparkleIcon,
  DocumentIcon,
  ChartIcon,
  SettingsIcon,
  TrashIcon,
} from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';
import { getDb } from '../db';

interface Props {
  onBack?: () => void;
  onQuickClose: () => void;
  onOpenSettings: () => void;
  onOpenTrend: () => void;
  onOpenSplash: () => void;
}

export const ProfileScreen: React.FC<Props> = ({
  onBack,
  onQuickClose,
  onOpenSettings,
  onOpenTrend,
  onOpenSplash,
}) => {
  const latest = useAppStore((s) => s.latestScreening);
  const recentCheckIns = useAppStore((s) => s.recentCheckIns);

  const handleClearAllData = () => {
    Alert.alert(
      'Hapus Seluruh Data Lokal?',
      'Semua riwayat skrining, cek-in harian, dan surat catatan akan dihapus permanen dari memori perangkat ini. Aplikasi akan kembali seperti baru diinstal.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDb();
              await db.execAsync('DELETE FROM screening_records;');
              await db.execAsync('DELETE FROM daily_checkins;');
              await db.execAsync('DELETE FROM win_logs;');
              await db.execAsync('DELETE FROM story_letters;');
              await db.execAsync('DELETE FROM settings;');
              void haptics.alert();
              Alert.alert('Data Berhasil Dihapus', 'Seluruh jejak lokal telah dibersihkan.');
              onOpenSplash();
            } catch (e) {
              Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data.');
            }
          },
        },
      ]
    );
  };

  const checkInCount = recentCheckIns.length;
  const lastScreeningDate = latest
    ? new Date(latest.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Belum ada';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.topTitle}>Profil & Privasi</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kartu Profil Anonim Estetik */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/lentera-icon.png')}
              style={styles.avatarImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.userName}>Pengguna LENTERA</Text>
          <View style={styles.anonymousBadge}>
            <ShieldLockIcon size={12} color={colors.primary} />
            <Text style={styles.anonymousBadgeText}>Akun Anonim • On-Device</Text>
          </View>

          {/* Statistik Tiga Kolom Sesuai DESIGN.md */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Skrining Terakhir</Text>
              <Text style={styles.statVal}>{lastScreeningDate}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Cek-in</Text>
              <Text style={styles.statVal}>{checkInCount} Hari</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Status Data</Text>
              <Text style={[styles.statVal, { color: colors.success }]}>100% Aman</Text>
            </View>
          </View>
        </View>

        {/* Menu Aksi Profil */}
        <Text style={styles.sectionLabel}>PENGATURAN & AKSES CEPAT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.primarySoft }]}>
              <SettingsIcon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Pengaturan Sistem & Mode Kerja</Text>
              <Text style={styles.menuSub}>Mode samaran, getaran napas, dan pengingat</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenTrend}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.tertiaryContainer }]}>
              <ChartIcon size={18} color="#9C6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Riwayat & Grafik Tren Skor</Text>
              <Text style={styles.menuSub}>Evaluasi perubahan kondisimu dari waktu ke waktu</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenSplash}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.secondaryContainer }]}>
              <SparkleIcon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Buka Panduan Welcome Screen</Text>
              <Text style={styles.menuSub}>Lihat kembali slide pengenalan fitur LENTERA</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Zona Privasi & Hapus Data */}
        <Text style={styles.sectionLabel}>KONTROL PRIVASI & PEMBERSIHAN DATA</Text>
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <ShieldLockIcon size={20} color={colors.primary} />
            <Text style={styles.privacyCardTitle}>Tanpa Rekam Jejak Luar</Text>
          </View>
          <Text style={styles.privacyCardDesc}>
            LENTERA dibangun dengan arsitektur zero-knowledge. Seluruh jawaban skrining K-10, PHQ-9, GAD-7, dan catatan suasana hatimu tersimpan di SQLite lokal perangkat ini saja.
          </Text>

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={handleClearAllData}
            activeOpacity={0.88}
          >
            <TrashIcon size={16} color={colors.crisis} />
            <Text style={styles.dangerBtnText}>Hapus Seluruh Data Saya di Perangkat Ini</Text>
          </TouchableOpacity>
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary, fontSize: 18 },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xs,
    paddingBottom: 96,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  avatarImg: {
    width: 50,
    height: 50,
  },
  userName: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.chip,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  anonymousBadgeText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
    textAlign: 'center',
  },
  statVal: {
    ...typography.labelLg,
    color: colors.onSurface,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.outlineVariant,
  },
  sectionLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.md,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  menuSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  privacyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.xl,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  privacyCardTitle: {
    ...typography.labelMd,
    color: colors.primary,
  },
  privacyCardDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.crisisContainer,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.crisis,
  },
  dangerBtnText: {
    ...typography.labelSm,
    color: colors.crisis,
    fontFamily: 'Montserrat-SemiBold',
  },
});
