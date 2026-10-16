import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { AMBIENT_TRACKS, ambient, type AmbientTrack } from '../services/ambientAudio';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';
import { SpeakerIcon, SpeakerOffIcon } from './Icons';

type VolumeLevel = 0.3 | 0.6 | 1.0;

const VOLUME_OPTIONS: { level: VolumeLevel; label: string }[] = [
  { level: 0.3, label: 'Lembut' },
  { level: 0.6, label: 'Sedang' },
  { level: 1.0, label: 'Jelas' },
];

/**
 * Pemutar suara latar luring (hujan, ombak, derau coklat).
 * Berkas audio dibundel di dalam APK, jadi tetap bekerja tanpa koneksi internet.
 */
export const AmbientPlayer: React.FC = () => {
  const [active, setActive] = useState<AmbientTrack | null>(null);
  const [volume, setVolume] = useState<VolumeLevel>(0.6);
  const [unsupported, setUnsupported] = useState(false);

  const ambientEnabled = useAppStore((s) => s.ambientEnabled);
  const toggleAmbient = useAppStore((s) => s.toggleAmbient);
  const logWin = useAppStore((s) => s.logWin);

  useEffect(() => {
    setUnsupported(!ambient.isSupported());
    return () => {
      ambient.stop();
    };
  }, []);

  const handleToggleTrack = (track: AmbientTrack) => {
    void haptics.tap();

    // Jika toggle ambient di Pengaturan belum aktif, aktifkan
    if (!ambientEnabled) {
      void toggleAmbient();
    }

    if (active === track) {
      ambient.pause();
      setActive(null);
      return;
    }

    ambient.play(track);
    ambient.setVolume(volume);
    setActive(track);

    // Catat kemenangan kecil setelah relaksasi
    void logWin('Mendengarkan suara latar relaksasi');
  };

  const handleChangeVolume = (lvl: VolumeLevel) => {
    void haptics.tap();
    setVolume(lvl);
    ambient.setVolume(lvl);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SpeakerIcon size={18} color={colors.primary} />
        <Text style={styles.title}>Suara Latar Relaksasi</Text>
      </View>
      <Text style={styles.sub}>
        Berkas audio tersimpan luring di perangkatmu. Pilih salah satu untuk menenangkan pikiran tanpa jaringan internet.
      </Text>

      <View style={styles.trackRow}>
        {AMBIENT_TRACKS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.track, active === t.id && styles.trackActive]}
            onPress={() => handleToggleTrack(t.id)}
            activeOpacity={0.85}
            accessibilityLabel={t.label}
          >
            <Text style={[styles.trackLabel, active === t.id && styles.trackLabelActive]}>
              {t.label}
            </Text>
            <Text style={[styles.trackHint, active === t.id && styles.trackHintActive]}>
              {t.hint}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Kontrol Volume saat track aktif */}
      {active !== null && !unsupported && (
        <View style={styles.volumeRow}>
          <Text style={styles.volumeTitle}>Tingkat Volume:</Text>
          <View style={styles.volumePills}>
            {VOLUME_OPTIONS.map((v) => {
              const isSelected = volume === v.level;
              return (
                <TouchableOpacity
                  key={v.label}
                  style={[styles.volumePill, isSelected && styles.volumePillActive]}
                  onPress={() => handleChangeVolume(v.level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.volumePillText, isSelected && styles.volumePillTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {unsupported && (
        <View style={styles.notice}>
          <SpeakerOffIcon size={14} color={colors.onWarningContainer} />
          <Text style={styles.noticeText}>
            Modul audio tidak tersedia di perangkat ini. Latihan tetap bisa dilakukan tanpa suara.
          </Text>
        </View>
      )}

      {active !== null && !unsupported && (
        <TouchableOpacity
          style={styles.stopHint}
          onPress={() => handleToggleTrack(active)}
          activeOpacity={0.7}
        >
          <Text style={styles.stopHintText}>Ketuk tombol suara lagi untuk menghentikan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { ...typography.labelLg, color: colors.primary },
  sub: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 },
  trackRow: { flexDirection: 'row', gap: spacing.sm },
  track: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  trackActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  trackLabel: {
    ...typography.labelMd,
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'Montserrat-SemiBold',
  },
  trackLabelActive: { color: colors.primary },
  trackHint: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  trackHintActive: { color: colors.primary },

  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  volumeTitle: {
    ...typography.labelSm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  volumePills: {
    flexDirection: 'row',
    gap: 4,
  },
  volumePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  volumePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  volumePillText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: colors.textSecondary,
  },
  volumePillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  notice: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    backgroundColor: colors.warningContainer,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  noticeText: { ...typography.bodySm, color: colors.onWarningContainer, flex: 1 },
  stopHint: { marginTop: spacing.sm, alignItems: 'center' },
  stopHintText: { ...typography.bodySm, fontSize: 11, color: colors.textSecondary },
});
