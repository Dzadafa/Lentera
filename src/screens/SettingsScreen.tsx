import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { useFontScale, type FontScale } from '../theme/FontScaleContext';
import { ChevronLeftIcon, TrashIcon, ShieldLockIcon, SparkleIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { useAppStore, type QuickCloseTarget } from '../store/appStore';
import { EMERGENCY_CONTACT } from '../content/referral';
import { haptics } from '../services/haptics';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
  onOpenSplash?: () => void;
}

const FONT_OPTIONS: { id: FontScale; label: string; desc: string }[] = [
  { id: 'small', label: 'Kecil (S)', desc: '90%' },
  { id: 'medium', label: 'Sedang (M)', desc: '100%' },
  { id: 'large', label: 'Besar (L)', desc: '115%' },
];

const QUICK_CLOSE_OPTIONS: { id: QuickCloseTarget; title: string; desc: string }[] = [
  {
    id: 'stealth',
    title: 'Mode Catatan Rahasia (Lokal)',
    desc: 'Layar langsung beralih ke aplikasi catatan belanja polos tanpa koneksi internet.',
  },
  {
    id: 'google',
    title: 'Buka Google Search',
    desc: 'Langsung mengalihkan layar ke halaman pencarian google.com.',
  },
  {
    id: 'wikipedia',
    title: 'Buka Wikipedia',
    desc: 'Langsung mengalihkan layar ke beranda ensiklopedia wikipedia.org.',
  },
];

export const SettingsScreen: React.FC<Props> = ({ onBack, onQuickClose, onOpenSplash }) => {
  const workMode = useAppStore((s) => s.workMode);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleWorkMode = useAppStore((s) => s.toggleWorkMode);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const voiceGuide = useAppStore((s) => s.voiceGuide);
  const toggleVoiceGuide = useAppStore((s) => s.toggleVoiceGuide);
  const ambientEnabled = useAppStore((s) => s.ambientEnabled);
  const toggleAmbient = useAppStore((s) => s.toggleAmbient);
  const nightlyReminder = useAppStore((s) => s.nightlyReminder);
  const toggleNightlyReminder = useAppStore((s) => s.toggleNightlyReminder);
  const quickCloseTarget = useAppStore((s) => s.quickCloseTarget);
  const setQuickCloseTarget = useAppStore((s) => s.setQuickCloseTarget);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const { fontScale, setFontScale, scaleMultiplier } = useFontScale();

  const handleSelectFontScale = async (scale: FontScale) => {
    void haptics.tap();
    await setFontScale(scale);
  };

  const handleSelectQuickClose = async (target: QuickCloseTarget) => {
    void haptics.tap();
    await setQuickCloseTarget(target);
  };

  const handleClearAllData = () => {
    void haptics.alert();
    // Konfirmasi Tingkat 1
    Alert.alert(
      'Hapus Semua Data Lokal?',
      'Semua riwayat skrining, catatan cek-in harian, kemenangan kecil, dan pengaturan akan dihapus permanen dari perangkat ini.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: () => {
            // Konfirmasi Tingkat 2 (Double Confirmation untuk keamanan privasi maksimal)
            Alert.alert(
              'Konfirmasi Terakhir',
              'Tindakan ini tidak dapat dibatalkan. Apakah kamu yakin ingin mengembalikan Lentera ke kondisi awal?',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus Bersih Sekarang',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await resetAllData();
                      void haptics.success();
                      Alert.alert(
                        'Data Berhasil Dibersihkan',
                        'Seluruh jejak lokal telah terhapus tanpa sisa.',
                        [
                          {
                            text: 'OK',
                            onPress: () => onOpenSplash?.(),
                          },
                        ]
                      );
                    } catch {
                      Alert.alert('Gagal', 'Terjadi kendala saat membersihkan data lokal.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
        {/* GRUP 1: TAMPILAN & AKSESIBILITAS */}
        <Text style={styles.groupLabel}>TAMPILAN & AKSESIBILITAS</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ukuran Teks Aplikasi</Text>
          <Text style={styles.cardSub}>
            Pilih ukuran teks yang paling nyaman dibaca oleh matamu.
          </Text>

          <View style={styles.segmentedRow}>
            {FONT_OPTIONS.map((opt) => {
              const isSelected = fontScale === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                  onPress={() => handleSelectFontScale(opt.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.segmentDesc, isSelected && styles.segmentDescActive]}>
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pratinjau Teks */}
          <View style={styles.previewBox}>
            <Text style={styles.previewCaption}>Pratinjau tampilan:</Text>
            <Text
              style={[
                styles.previewText,
                { fontSize: Math.round(15 * scaleMultiplier), lineHeight: Math.round(22 * scaleMultiplier) },
              ]}
            >
              Lentera adalah ruang aman untuk pikiranmu — hadir tanpa penilaian dan tanpa tuntutan.
            </Text>
          </View>
        </View>

        {/* GRUP 2: SUARA & PERANGKAT */}
        <Text style={styles.groupLabel}>SUARA & PERANGKAT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Suara Latar (Ambien)</Text>
              <Text style={styles.rowSub}>
                Putar suara hujan, ombak, atau derau coklat luring saat latihan relaksasi.
              </Text>
            </View>
            <Switch
              value={ambientEnabled}
              onValueChange={toggleAmbient}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Getaran Napas (Haptik)</Text>
              <Text style={styles.rowSub}>
                Perangkat bergetar lembut memandu tarikan dan embusan napas.
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
              <Text style={styles.rowTitle}>Mode Panduan Suara</Text>
              <Text style={styles.rowSub}>
                Langkah latihan dibacakan oleh mesin suara bawaan perangkat tanpa koneksi internet.
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

        {/* GRUP 3: PENGINGAT HARIAN */}
        <Text style={styles.groupLabel}>PENGINGAT RUTIN</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Pengingat Tutup Hari</Text>
              <Text style={styles.rowSub}>
                Notifikasi lokal setiap pukul 20.30 untuk mencatat suasana hati. Pesan bersifat netral dan tidak membocorkan kondisi apa pun di layar kunci.
              </Text>
            </View>
            <Switch
              value={nightlyReminder}
              onValueChange={toggleNightlyReminder}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* GRUP 4: KONFIGURASI TOMBOL PANIK */}
        <Text style={styles.groupLabel}>TOMBOL PANIK (MODE CEPAT)</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tujuan Pengalihan Layar</Text>
          <Text style={styles.cardSub}>
            Tentukan apa yang langsung ditampilkan saat tombol panik ditekan di situasi mendesak:
          </Text>

          <View style={styles.optionsList}>
            {QUICK_CLOSE_OPTIONS.map((opt) => {
              const isSelected = quickCloseTarget === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.radioItem, isSelected && styles.radioItemActive]}
                  onPress={() => handleSelectQuickClose(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioDotWrap}>
                    <View style={[styles.radioDot, isSelected && styles.radioDotActive]} />
                  </View>
                  <View style={styles.radioTextWrap}>
                    <Text style={[styles.radioTitle, isSelected && styles.radioTitleActive]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.radioDesc}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* GRUP 5: PRIVASI & SAMARAN */}
        <Text style={styles.groupLabel}>PRIVASI & SAMARAN</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Mode Kerja (Samaran)</Text>
              <Text style={styles.rowSub}>
                Mengubah tampilan judul dan menu menjadi aplikasi catatan produktivitas biasa.
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

        {/* GRUP 6: PRIVACY SHREDDER / HAPUS DATA */}
        <Text style={styles.groupLabel}>MANAJEMEN DATA LOKAL</Text>
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.dangerHeader}>
            <TrashIcon size={18} color={colors.error} />
            <Text style={styles.dangerTitle}>Hapus Seluruh Data Lokal</Text>
          </View>
          <Text style={styles.dangerSub}>
            Menghapus permanen seluruh riwayat skrining, cek-in energi harian, catatan kemenangan, dan preferensi dari memori ponsel ini.
          </Text>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={handleClearAllData}
            activeOpacity={0.85}
          >
            <Text style={styles.dangerBtnText}>Bersihkan Semua Data</Text>
          </TouchableOpacity>
        </View>

        {/* BANTUAN DARURAT & PENGENALAN */}
        <Text style={styles.groupLabel}>BANTUAN KRISIS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{EMERGENCY_CONTACT.label}</Text>
              <Text style={styles.rowSub}>
                Nomor darurat {EMERGENCY_CONTACT.display} bebas pulsa, siap dihubungi 24 jam bila kamu membutuhkan pertolongan mendesak.
              </Text>
            </View>
          </View>
        </View>

        {onOpenSplash && (
          <TouchableOpacity
            style={styles.splashCard}
            onPress={onOpenSplash}
            activeOpacity={0.85}
          >
            <View style={styles.splashTextGroup}>
              <Text style={styles.splashTitle}>Pengenalan & Filosofi Lentera</Text>
              <Text style={styles.splashSub}>Buka kembali slide pengantar awal aplikasi</Text>
            </View>
            <ChevronLeftIcon size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoBadgeRow}>
            <ShieldLockIcon size={14} color={colors.primary} />
            <Text style={styles.infoTitle}>Komitmen Privasi Lentera</Text>
          </View>
          <Text style={styles.infoBody}>
            Lentera tidak memerlukan akun, tidak menyimpan kata sandi, dan tidak mentransmisikan data kesehatan mentalmu ke server mana pun. Seluruh catatan murni tersimpan di database lokal perangkatmu.
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
    paddingBottom: spacing.xxl + 40,
  },
  groupLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardTitle: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  cardSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.md,
  },
  rowText: { flex: 1 },
  rowTitle: { ...typography.labelLg, color: colors.textPrimary },
  rowSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },

  // Segmented Font Scale
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainer,
    padding: 4,
    borderRadius: radius.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-SemiBold',
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  segmentDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  segmentDescActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  previewBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  previewCaption: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  previewText: {
    fontFamily: 'Montserrat-Medium',
    color: colors.textPrimary,
  },

  // Quick close options
  optionsList: {
    gap: spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  radioItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radioDotWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.sm,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioDotActive: {
    backgroundColor: colors.primary,
  },
  radioTextWrap: {
    flex: 1,
  },
  radioTitle: {
    ...typography.labelSm,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.textPrimary,
  },
  radioTitleActive: {
    color: colors.primary,
  },
  radioDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  // Danger Card
  dangerCard: {
    borderColor: colors.errorContainer,
    backgroundColor: '#FFF8F8',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  dangerTitle: {
    ...typography.labelLg,
    color: colors.error,
  },
  dangerSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  dangerBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    ...typography.labelSm,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoTitle: { ...typography.labelLg, color: colors.onPrimaryContainer },
  infoBody: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    lineHeight: 19,
  },

  splashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.md,
  },
  splashTextGroup: { flex: 1 },
  splashTitle: { ...typography.cardTitle, color: colors.primary },
  splashSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
});
