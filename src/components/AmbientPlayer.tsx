import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { AMBIENT_TRACKS, ambient, type AmbientTrack } from '../services/ambientAudio';
import { haptics } from '../services/haptics';
import { SpeakerIcon, SpeakerOffIcon } from './Icons';

/**
 * Pemutar suara latar luring (hujan, ombak, derau coklat).
 * Berkas audio dibundel di dalam APK, jadi tetap bekerja dalam mode pesawat.
 */
export const AmbientPlayer: React.FC = () => {
  const [active, setActive] = useState<AmbientTrack | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    setUnsupported(!ambient.isSupported());
    return () => ambient.stop();
  }, []);

  const toggle = (track: AmbientTrack) => {
    void haptics.tap();
    if (active === track) {
      ambient.pause();
      setActive(null);
      return;
    }
    ambient.play(track);
    setActive(track);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SpeakerIcon size={18} color={colors.secondary} />
        <Text style={styles.title}>Suara Latar</Text>
      </View>
      <Text style={styles.sub}>
        Berkas suara sudah ada di dalam aplikasi, jadi tetap bisa dipakai tanpa internet. Pilih satu
        untuk menemani latihanmu.
      </Text>

      <View style={styles.trackRow}>
        {AMBIENT_TRACKS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.track, active === t.id && styles.trackActive]}
            onPress={() => toggle(t.id)}
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

      {unsupported && (
        <View style={styles.notice}>
          <SpeakerOffIcon size={14} color={colors.onWarningContainer} />
          <Text style={styles.noticeText}>
            Modul audio tidak tersedia di perangkat ini. Latihan tetap bisa dilakukan tanpa suara.
          </Text>
        </View>
      )}

      {active !== null && !unsupported && (
        <TouchableOpacity style={styles.stopHint} onPress={() => toggle(active)} activeOpacity={0.7}>
          <Text style={styles.stopHintText}>Ketuk lagi untuk menghentikan suara</Text>
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
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
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
  trackActive: { backgroundColor: colors.secondaryContainer, borderColor: colors.secondary },
  trackLabel: { ...typography.labelMd, color: colors.onSurface, marginBottom: 2 },
  trackLabelActive: { color: colors.onSecondaryContainer },
  trackHint: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  trackHintActive: { color: colors.onSecondaryContainer },
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
  stopHintText: { ...typography.bodySm, color: colors.onSurfaceVariant },
});
