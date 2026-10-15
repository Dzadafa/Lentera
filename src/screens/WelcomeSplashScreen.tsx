import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../theme';
import { haptics } from '../services/haptics';
import {
  HeartPulseIcon,
  WindIcon,
  DocumentIcon,
  ShieldLockIcon,
  ChevronRightIcon,
  SparkleIcon,
} from '../components/Icons';

interface Props {
  onComplete: () => void;
}

interface SlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: { title: string; desc: string; emoji: string }[];
  iconType: 'logo' | 'quiz' | 'calm' | 'bpjs';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES: SlideItem[] = [
  {
    id: 'intro',
    badge: '100% LOKAL & ANONIM',
    badgeColor: colors.primary,
    badgeBg: colors.primaryContainer,
    title: 'Selamat Datang di LENTERA',
    subtitle: 'Ruang aman kesehatan mental mandiri',
    description:
      'LENTERA adalah jembatan pertama untuk memahami kondisi pikiranmu secara mandiri, tanpa login, tanpa akun, dan tanpa data yang dikirim ke internet.',
    highlights: [
      {
        emoji: '🔒',
        title: 'Zero-Cloud Privacy',
        desc: 'Seluruh jawaban tersimpan di database ponselmu saja.',
      },
      {
        emoji: '🌱',
        title: 'Bebas Hambatan & Stigma',
        desc: 'Buka dan gunakan kapan pun saat kamu merasa berat.',
      },
    ],
    iconType: 'logo',
  },
  {
    id: 'screening',
    badge: 'SKRINING BERTINGKAT',
    badgeColor: '#573B00',
    badgeBg: colors.tertiaryContainer,
    title: 'Skrining K-10, PHQ-9 & GAD-7',
    subtitle: 'Cepat, terstruktur, dan tidak melelahkan',
    description:
      'Kami menggunakan alur skrining bertingkat yang efisien agar kamu tidak harus menjawab puluhan pertanyaan sekaligus.',
    highlights: [
      {
        emoji: '⚡',
        title: 'K-10 Cepat (10 Butir)',
        desc: 'Cukup 10 butir awal untuk mengukur distres psikologis global.',
      },
      {
        emoji: '🎯',
        title: 'PHQ-9 & GAD-7 Terarah',
        desc: 'Terbuka otomatis jika terindikasi distres tinggi (skor ≥ 25) untuk memetakan depresi & kecemasan.',
      },
    ],
    iconType: 'quiz',
  },
  {
    id: 'calm_room',
    badge: 'PERTOLONGAN INSTAN',
    badgeColor: colors.primary,
    badgeBg: colors.secondaryContainer,
    title: 'Ruang Tenang 1 Ketukan',
    subtitle: 'Bantuan saat ini juga tanpa kuis',
    description:
      'Sedang panik, cemas memuncak, atau sesak? Masuk langsung ke Ruang Tenang tanpa perlu menjawab kuis apa pun terlebih dahulu.',
    highlights: [
      {
        emoji: '🌬️',
        title: 'Napas & Grounding 5-4-3-2-1',
        desc: 'Menurunkan denyut jantung dan menstabilkan sistem saraf.',
      },
      {
        emoji: '✨',
        title: 'Pelepas Beban Pikiran',
        desc: 'Tulis kekhawatiranmu dan bakar secara simbolis di layar.',
      },
    ],
    iconType: 'calm',
  },
  {
    id: 'referral',
    badge: 'PANDUAN BPJS & FASKES',
    badgeColor: '#1B1B23',
    badgeBg: '#E9E5F3',
    title: 'Langkah Nyata ke Faskes',
    subtitle: 'Naskah siap pakai di loket puskesmas',
    description:
      'Bingung bagaimana bicara ke petugas loket atau dokter umum? LENTERA menyediakan panduan 3 langkah berobat dengan BPJS.',
    highlights: [
      {
        emoji: '📋',
        title: 'Kalimat Siap Pakai di Loket',
        desc: 'Cukup baca atau tunjukkan kalimat yang sudah disiapkan.',
      },
      {
        emoji: '📄',
        title: 'Cetak Lembar Gejala (PDF)',
        desc: 'Rangkuman keluhan siap cetak untuk dokter umum tanpa perlu bingung merangkai kata.',
      },
    ],
    iconType: 'bpjs',
  },
];

export const WelcomeSplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animasi halus floating badge & bounce
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, pulseAnim]);

  const handleFinish = () => {
    void haptics.tap();
    onComplete();
  };

  const handleNextSlide = () => {
    void haptics.tap();
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const renderSlideIcon = (type: SlideItem['iconType']) => {
    switch (type) {
      case 'logo':
        return (
          <Animated.View style={[styles.logoWrap, { transform: [{ translateY: floatAnim }] }]}>
            <Image
              source={require('../../assets/lentera-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        );
      case 'quiz':
        return (
          <Animated.View style={[styles.iconWrap, { backgroundColor: colors.tertiaryContainer, borderColor: colors.tertiary, transform: [{ scale: pulseAnim }] }]}>
            <HeartPulseIcon size={38} color="#9C6B00" />
          </Animated.View>
        );
      case 'calm':
        return (
          <Animated.View style={[styles.iconWrap, { backgroundColor: colors.secondaryContainer, borderColor: colors.secondary, transform: [{ translateY: floatAnim }] }]}>
            <WindIcon size={38} color={colors.primary} />
          </Animated.View>
        );
      case 'bpjs':
        return (
          <Animated.View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer, borderColor: colors.primary, transform: [{ translateY: floatAnim }] }]}>
            <DocumentIcon size={36} color={colors.primary} />
          </Animated.View>
        );
    }
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Top Header dengan tombol Lewati */}
      <View style={styles.topHeader}>
        <View style={styles.brandSmallRow}>
          <Image
            source={require('../../assets/lentera-icon.png')}
            style={styles.smallLogo}
            resizeMode="contain"
          />
          <Text style={styles.smallBrandName}>LENTERA</Text>
        </View>

        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleFinish}
            style={styles.skipBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipBtnText}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
            <View style={styles.slideCard}>
              <View style={styles.slideHeader}>
                {renderSlideIcon(item.iconType)}
                <View style={[styles.badge, { backgroundColor: item.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>
              </View>

              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>

              {/* Box Rincian / Kelebihan Interaktif */}
              <View style={styles.highlightsContainer}>
                {item.highlights.map((h: { title: string; desc: string; emoji: string }, i: number) => (
                  <View key={i} style={styles.highlightItem}>
                    <View style={styles.highlightEmojiBubble}>
                      <Text style={styles.highlightEmojiText}>{h.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.highlightTitle}>{h.title}</Text>
                      <Text style={styles.highlightDesc}>{h.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls: Pagination Indicator & Action Button */}
      <View style={styles.bottomBar}>
        {/* Indikator Slide */}
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                void haptics.tap();
              }}
              style={[
                styles.dot,
                activeIndex === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Tombol CTA */}
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.88}
          onPress={handleNextSlide}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Buka LENTERA, tanpa akun' : 'Lanjut ke slide berikutnya'}
        >
          <Text style={styles.primaryBtnText}>
            {isLastSlide ? 'Mulai Sekarang, Tanpa Akun' : 'Lanjut'}
          </Text>
          {!isLastSlide && <ChevronRightIcon size={18} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Catatan Privasi Jelas */}
        <View style={styles.privacyRow}>
          <ShieldLockIcon size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.privacyNote}>
            100% aman di perangkat. Tidak ada yang direkam atau dikirim keluar.
          </Text>
        </View>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  brandSmallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  smallLogo: {
    width: 24,
    height: 24,
  },
  smallBrandName: {
    ...typography.headlineMd,
    color: colors.primary,
    letterSpacing: 1.2,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  skipBtnText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  slideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.card,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  badgeText: {
    ...typography.labelSm,
    letterSpacing: 0.8,
  },
  slideTitle: {
    ...typography.headlineLg,
    color: colors.onSurface,
    marginBottom: 4,
  },
  slideSubtitle: {
    ...typography.labelMd,
    color: colors.primary,
    marginBottom: spacing.sm + 2,
  },
  slideDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlightsContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  highlightEmojiBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  highlightEmojiText: {
    fontSize: 16,
  },
  highlightTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  highlightDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.surfaceContainerHigh,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.card,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  privacyNote: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
