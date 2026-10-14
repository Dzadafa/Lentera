import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../theme';
import { haptics } from '../services/haptics';

interface Props {
  onComplete: () => void;
}

export const WelcomeSplashScreen: React.FC<Props> = ({ onComplete }) => {
  const handleFinish = () => {
    void haptics.tap();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo — satu elemen visual, tanpa hiasan tambahan */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/lentera-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Nama merek — tanpa tagline kutipan miring */}
        <Text style={styles.brandName}>LENTERA</Text>

        {/* Penjelasan yang jujur, bukan klaim produk */}
        <Text style={styles.description}>
          Alat skrining kondisi mental dan panduan ke faskes BPJS — anonim, tanpa akun, tanpa data yang keluar dari perangkat ini.
        </Text>

        {/* Tiga fakta konkret — teks biasa, penanda titik kuning lentera */}
        <View style={styles.factList}>
          <View style={styles.factRow}>
            <View style={styles.factDot} />
            <Text style={styles.factText}>
              Skrining DASS-21: 21 pertanyaan, hasil 3 dimensi, sekitar 3 menit.
            </Text>
          </View>
          <View style={styles.factRow}>
            <View style={styles.factDot} />
            <Text style={styles.factText}>
              Ruang Tenang bisa dibuka 1 ketukan — tanpa menjawab apa pun dulu.
            </Text>
          </View>
          <View style={styles.factRow}>
            <View style={styles.factDot} />
            <Text style={styles.factText}>
              Panduan berobat BPJS: 3 langkah, termasuk kalimat siap pakai untuk loket.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom action — satu CTA, pesan privasi tepat di bawahnya */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.88}
          onPress={handleFinish}
          accessibilityRole="button"
          accessibilityLabel="Buka LENTERA, tanpa akun"
        >
          <Text style={styles.primaryBtnText}>Buka, tanpa akun</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Tidak ada yang direkam. Tidak ada yang keluar dari perangkat ini.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  brandName: {
    ...typography.displayLg,
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  factList: {
    gap: spacing.md,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
  },
  factDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
    marginTop: 9,
    flexShrink: 0,
  },
  factText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 22,
  },
  bottomBar: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  privacyNote: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});


