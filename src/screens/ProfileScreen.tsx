import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import {
  ChevronLeftIcon,
  ShieldLockIcon,
  SparkleIcon,
  ChartIcon,
  SettingsIcon,
  TrashIcon,
  CheckIcon,
} from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';
import { getSetting, setSetting, getWinLog } from '../db';

interface Props {
  onBack?: () => void;
  onQuickClose: () => void;
  onOpenSettings: () => void;
  onOpenTrend: () => void;
  onOpenSplash: () => void;
}

type AvatarType = 'lentera' | 'sparkle' | 'plant' | 'heart' | 'shield';

const AVATAR_OPTIONS: { id: AvatarType; label: string; emoji: string }[] = [
  { id: 'lentera', label: 'Lentera', emoji: '🏮' },
  { id: 'sparkle', label: 'Cahaya', emoji: '✨' },
  { id: 'plant', label: 'Tunas', emoji: '🌱' },
  { id: 'heart', label: 'Empati', emoji: '💜' },
  { id: 'shield', label: 'Pelindung', emoji: '🛡️' },
];

const PROFANITY_WORDS = ['anjing', 'bangsat', 'babi', 'kontol', 'memek', 'tai', 'tolol', 'goblok'];

export const ProfileScreen: React.FC<Props> = ({
  onBack,
  onQuickClose,
  onOpenSettings,
  onOpenTrend,
  onOpenSplash,
}) => {
  const latest = useAppStore((s) => s.latestScreening);
  const recentCheckIns = useAppStore((s) => s.recentCheckIns);
  const streakCount = useAppStore((s) => s.streakCount);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const [nickname, setNickname] = useState('Pengguna Lentera');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('lentera');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempAvatar, setTempAvatar] = useState<AvatarType>('lentera');
  const [todayWins, setTodayWins] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const savedNick = await getSetting('user_nickname');
      if (savedNick) setNickname(savedNick);

      const savedAvatar = await getSetting('user_avatar');
      if (savedAvatar) setSelectedAvatar(savedAvatar as AvatarType);

      const wins = await getWinLog();
      if (wins) setTodayWins(wins);
    })();
  }, []);

  const openEditModal = () => {
    setTempNickname(nickname);
    setTempAvatar(selectedAvatar);
    setIsEditModalOpen(true);
    void haptics.tap();
  };

  const handleSaveProfile = async () => {
    const trimmed = tempNickname.trim();
    if (!trimmed) {
      Alert.alert('Nama Tidak Boleh Kosong', 'Silakan masukkan nama samaran panggilanmu.');
      return;
    }

    // Filter kata kasar sederhana
    const lower = trimmed.toLowerCase();
    const hasProfanity = PROFANITY_WORDS.some((word) => lower.includes(word));
    if (hasProfanity) {
      Alert.alert('Nama Tidak Sesuai', 'Gunakan nama samaran yang santun dan nyaman dibaca.');
      return;
    }

    await setSetting('user_nickname', trimmed);
    await setSetting('user_avatar', tempAvatar);
    setNickname(trimmed);
    setSelectedAvatar(tempAvatar);
    setIsEditModalOpen(false);
    void haptics.success();
  };

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
              await resetAllData();
              void haptics.alert();
              Alert.alert('Data Berhasil Dihapus', 'Seluruh jejak lokal telah dibersihkan.');
              onOpenSplash();
            } catch {
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

  // 7 Hari Terakhir untuk grafik mini mood
  const last7DaysMood = useMemo(() => {
    const list: { dayName: string; dateStr: string; mood: number | null }[] = [];
    const checkInMap = new Map<string, number>();
    recentCheckIns.forEach((c) => checkInMap.set(c.date, c.mood));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'narrow' });
      const moodVal = checkInMap.get(dStr) ?? null;
      list.push({ dayName, dateStr: dStr, mood: moodVal });
    }

    return list;
  }, [recentCheckIns]);

  const currentAvatarEmoji = useMemo(() => {
    const found = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar);
    return found ? found.emoji : '🏮';
  }, [selectedAvatar]);

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
        {/* Kartu Profil Utama */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity style={styles.avatarWrap} onPress={openEditModal} activeOpacity={0.85}>
            {selectedAvatar === 'lentera' ? (
              <Image
                source={require('../../assets/lentera-icon.png')}
                style={styles.avatarImg}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.avatarEmojiText}>{currentAvatarEmoji}</Text>
            )}
            <View style={styles.editAvatarBadge}>
              <Text style={styles.editAvatarBadgeText}>Ubah</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nameRow} onPress={openEditModal} activeOpacity={0.7}>
            <Text style={styles.userName}>{nickname}</Text>
          </TouchableOpacity>

          <View style={styles.anonymousBadge}>
            <ShieldLockIcon size={12} color={colors.primary} />
            <Text style={styles.anonymousBadgeText}>Profil Samaran • 100% On-Device</Text>
          </View>

          {/* Statistik Tiga Kolom */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Skrining Terakhir</Text>
              <Text style={styles.statVal}>{lastScreeningDate}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Rangkaian Aktif</Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>{streakCount} Hari 🔥</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Cek-in</Text>
              <Text style={styles.statVal}>{checkInCount} Kali</Text>
            </View>
          </View>
        </View>

        {/* Tren Mood 7 Hari Terakhir */}
        <Text style={styles.sectionLabel}>TREN SUASANA HATI 7 HARI TERAKHIR</Text>
        <View style={styles.card}>
          <View style={styles.moodChartHeader}>
            <Text style={styles.cardTitle}>Fluktuasi Energi Emosional</Text>
            <Text style={styles.moodScoreDesc}>Skala 1 - 5</Text>
          </View>

          <View style={styles.moodBarsRow}>
            {last7DaysMood.map((item, idx) => {
              const hasMood = item.mood !== null;
              const barHeight = hasMood ? Math.max(16, (item.mood! / 5) * 64) : 8;
              return (
                <View key={item.dateStr} style={styles.moodCol}>
                  <View style={styles.moodBarTrack}>
                    <View
                      style={[
                        styles.moodBarFill,
                        {
                          height: barHeight,
                          backgroundColor: hasMood ? colors.primary : colors.surfaceContainerHigh,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, idx === 6 && styles.dayLabelToday]}>
                    {item.dayName}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.moodHint}>
            {last7DaysMood.some((m) => m.mood !== null)
              ? 'Pola energi emosionalmu tercatat secara berkala tanpa pernah keluar dari ponsel ini.'
              : 'Belum ada cek-in suasana hati minggu ini. Buka Beranda untuk mulai mencatat.'}
          </Text>
        </View>

        {/* Kemenangan Kecil Hari Ini */}
        <Text style={styles.sectionLabel}>KEMENANGAN KECIL HARI INI</Text>
        <View style={styles.card}>
          {todayWins.length > 0 ? (
            <View style={styles.winsList}>
              {todayWins.map((win, i) => (
                <View key={i} style={styles.winItem}>
                  <View style={styles.winCheckCircle}>
                    <CheckIcon size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.winText}>{win}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyWinBox}>
              <SparkleIcon size={18} color={colors.primary} />
              <Text style={styles.emptyWinText}>
                Belum ada catatan aktivitas hari ini. Menyelesaikan satu latihan relaksasi atau mencatat energi sudah merupakan kemenangan berharga.
              </Text>
            </View>
          )}
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
              <Text style={styles.menuTitle}>Pengaturan Sistem & Skala Teks</Text>
              <Text style={styles.menuSub}>Ukuran font, suara latar, pengingat, dan mode panik</Text>
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
              <Text style={styles.menuSub}>Lihat kembali slide pengenalan fitur Lentera</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Zona Privasi & Hapus Data */}
        <Text style={styles.sectionLabel}>KONTROL PRIVASI & PEMBERSIHAN DATA</Text>
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <ShieldLockIcon size={20} color={colors.primary} />
            <Text style={styles.privacyTitle}>Privasi Nol-Jaringan</Text>
          </View>
          <Text style={styles.privacyBody}>
            Lentera tidak memerlukan akun, tidak menyimpan kata sandi, dan tidak pernah mengunggah data kesehatan mentalmu ke server mana pun. Seluruh catatan murni tersimpan di database lokal perangkatmu.
          </Text>

          <TouchableOpacity
            style={styles.deleteDataBtn}
            onPress={handleClearAllData}
            activeOpacity={0.8}
          >
            <TrashIcon size={16} color={colors.error} />
            <Text style={styles.deleteDataBtnText}>Hapus Seluruh Data di Perangkat Ini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Edit Nama Samaran & Avatar */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Profil Samaran</Text>
            <Text style={styles.modalSub}>
              Pilih nama panggilan santai dan avatar yang menggambarkan suasana hatimu.
            </Text>

            {/* Pilihan Avatar */}
            <Text style={styles.inputLabel}>PILIH AVATAR</Text>
            <View style={styles.avatarPickerRow}>
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = tempAvatar === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.avatarPickItem, isSelected && styles.avatarPickItemActive]}
                    onPress={() => {
                      void haptics.tap();
                      setTempAvatar(opt.id);
                    }}
                  >
                    <Text style={styles.avatarPickEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.avatarPickLabel, isSelected && styles.avatarPickLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input Nama Samaran */}
            <Text style={styles.inputLabel}>NAMA PANGGILAN SAMARAN</Text>
            <TextInput
              style={styles.textInput}
              value={tempNickname}
              onChangeText={setTempNickname}
              placeholder="Contoh: Teman Lentera, Kawan Teduh"
              placeholderTextColor={colors.textMuted}
              maxLength={24}
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  topTitle: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  avatarImg: {
    width: 48,
    height: 48,
  },
  avatarEmojiText: {
    fontSize: 36,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  editAvatarBadgeText: {
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 2,
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  anonymousBadgeText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statVal: {
    ...typography.labelLg,
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'Montserrat-Bold',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.outlineVariant,
  },
  sectionLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },

  // Mood Chart
  moodChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodScoreDesc: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textSecondary,
  },
  moodBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  moodCol: {
    alignItems: 'center',
    flex: 1,
  },
  moodBarTrack: {
    width: 14,
    height: 64,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  moodBarFill: {
    width: '100%',
    borderRadius: radius.full,
  },
  dayLabel: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  dayLabelToday: {
    color: colors.primary,
    fontFamily: 'Montserrat-Bold',
  },
  moodHint: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },

  // Small Wins
  winsList: {
    gap: spacing.xs,
  },
  winItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  winCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontFamily: 'Montserrat-Medium',
  },
  emptyWinBox: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 6,
  },
  emptyWinText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Menus
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  menuSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.md,
  },

  // Privacy Zone
  privacyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: 4,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  privacyTitle: {
    ...typography.labelLg,
    color: colors.primary,
  },
  privacyBody: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  deleteDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.errorContainer,
    backgroundColor: '#FFF8F8',
  },
  deleteDataBtnText: {
    ...typography.labelSm,
    color: colors.error,
    fontFamily: 'Montserrat-SemiBold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 35, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modalTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  inputLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  avatarPickItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    width: '18%',
  },
  avatarPickItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  avatarPickEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  avatarPickLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat-Medium',
    color: colors.textSecondary,
  },
  avatarPickLabelActive: {
    color: colors.primary,
    fontFamily: 'Montserrat-Bold',
  },
  textInput: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.bodySm,
    color: colors.textPrimary,
    fontFamily: 'Montserrat-Medium',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  modalCancelBtnText: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  modalSaveBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
});
