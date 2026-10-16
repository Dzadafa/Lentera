import React, { useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, radius, spacing } from '../theme';
import { SparkleIcon, ShareIcon } from './Icons';
import { haptics } from '../services/haptics';

export interface StoryCardData {
  quote: string;
  story: string;
  actionTaken: string;
  author?: string;
  timeAgo?: string;
  conditionLabel?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: StoryCardData | null;
}

export const StoryCardModal: React.FC<Props> = ({ visible, onClose, data }) => {
  const cardRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Menyusun teks caption pengantar yang ramah & menyentuh
  const captionText = useMemo(() => {
    if (!data) return '';
    return [
      `"${data.quote}"`,
      '',
      `Setiap langkah kecil berharga, dan kamu tidak berjalan sendirian. 🌿`,
      '',
      `Langkah nyata: ${data.actionTaken}`,
      '',
      `Temukan panduan faskes, skrining mandiri anonim, dan kisah penguat lainnya:`,
      `🔗 https://lentera.app`,
      '',
      `#Lentera #KesehatanMental #TemanMelangkah`,
    ].join('\n');
  }, [data]);

  if (!data) return null;

  const handleCopyCaption = async () => {
    try {
      void haptics.success();
      await Clipboard.setStringAsync(captionText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat menyalin caption.');
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;

    try {
      void haptics.tap();
      setIsCapturing(true);

      // Otomatis salin caption ke clipboard agar siap di-paste saat share ke medsos/WA
      await Clipboard.setStringAsync(captionText);

      // Tangkap View kartu menjadi gambar PNG beresolusi tinggi
      let captureRefFunc: any = null;
      try {
        const viewShot = require('react-native-view-shot');
        captureRefFunc = viewShot?.captureRef || viewShot?.default?.captureRef;
      } catch {
        // Fallback jika native module belum tersedia di client tertentu
      }

      if (!captureRefFunc) {
        Alert.alert(
          'Teks Telah Disalin',
          'Pesan penguat berhasil disalin ke clipboard! Fitur ekspor gambar kartu membutuhkan build native mandiri (apk/prebuild).'
        );
        return;
      }

      const uri = await captureRefFunc(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Bagikan Kartu Penguat Lentera',
          UTI: 'public.png',
        });
      } else {
        Alert.alert('Info', 'Fitur berbagi file belum didukung di perangkat ini.');
      }
    } catch {
      Alert.alert('Gagal', 'Terjadi kendala saat memproses gambar kartu ucapan.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Lembar Modal */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Kartu Penguat Jiwa</Text>
              <Text style={styles.sheetSub}>Pratinjau kartu gambar siap dibagikan</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Tutup"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}
          >
            {/* Visual Greeting Card (Area yang di-capture menjadi gambar PNG) */}
            <View
              ref={cardRef}
              collapsable={false}
              style={styles.cardWrapper}
            >
              {/* Garis Aksen Bar Atas */}
              <View style={styles.topAccentBar} />

              {/* Header Kartu: Keterangan Aplikasi Lentera di Kiri Atas */}
              <View style={styles.cardHeader}>
                <View style={styles.brandLeftContainer}>
                  <Image
                    source={require('../../assets/lentera-icon.png')}
                    style={styles.brandIconImg}
                    resizeMode="contain"
                  />
                  <View style={styles.brandTextGroup}>
                    <Text style={styles.brandAppName}>Lentera</Text>
                    <Text style={styles.brandAppTagline}>Kesehatan Mental Mandiri</Text>
                  </View>
                </View>

                {data.conditionLabel ? (
                  <View style={styles.tierChip}>
                    <Text style={styles.tierChipText}>{data.conditionLabel}</Text>
                  </View>
                ) : null}
              </View>

              {/* Tanda Kutip Editorial */}
              <Text style={styles.quoteMark}>“</Text>

              {/* Kutipan Utama */}
              <Text style={styles.cardQuote}>"{data.quote}"</Text>

              {/* Tubuh Kisah Penguat */}
              <Text style={styles.cardStoryText}>{data.story}</Text>

              {/* Kotak Aksi / Langkah Nyata */}
              <View style={styles.actionBox}>
                <Text style={styles.actionLabel}>🌱 LANGKAH NYATA</Text>
                <Text style={styles.actionContent}>{data.actionTaken}</Text>
              </View>

              {/* Garis Pemisah Footer */}
              <View style={styles.cardFooterDivider} />

              {/* Footer Kartu yang Dirapikan */}
              <View style={styles.cardFooter}>
                <View style={styles.footerAuthorCol}>
                  <Text style={styles.footerStoryLabel}>Dikisahkan oleh</Text>
                  <Text style={styles.footerAuthorName} numberOfLines={1}>
                    {data.author || 'Teman Lentera'}
                  </Text>
                </View>

                <View style={styles.footerWarmthBadge}>
                  <SparkleIcon size={12} color={colors.primary} />
                  <Text style={styles.footerWarmthText}>Kamu tidak berjalan sendirian</Text>
                </View>
              </View>

              {/* Tautan Resmi Aplikasi di Kaki Kartu Gambar */}
              <View style={styles.cardLinkRow}>
                <Text style={styles.cardLinkText}>
                  Temukan langkah pulihmu di <Text style={styles.cardLinkHighlight}>lentera.app</Text>
                </Text>
              </View>
            </View>

            {/* Kotak Caption & Tautan Pengantar */}
            <View style={styles.captionBox}>
              <View style={styles.captionBoxHeader}>
                <View style={styles.captionBadge}>
                  <SparkleIcon size={12} color={colors.primary} />
                  <Text style={styles.captionBadgeText}>Caption & Tautan Pengantar</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyCaption}
                  style={styles.captionCopyBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Salin caption"
                >
                  <Text style={styles.captionCopyBtnText}>
                    {isCopied ? '✓ Tersalin' : 'Salin Teks'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.captionPreviewText}>{captionText}</Text>

              <Text style={styles.captionHelperNote}>
                💡 Teks dan link di atas otomatis tersalin saat kamu menekan tombol bagikan di bawah.
              </Text>
            </View>

            {/* Tombol Utama: Langsung Bagikan File Gambar */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryShareBtn}
                onPress={handleShareImage}
                activeOpacity={0.88}
                disabled={isCapturing}
                accessibilityLabel="Bagikan gambar kartu ucapan"
              >
                {isCapturing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <ShareIcon size={18} color="#FFFFFF" />
                    <Text style={styles.primaryShareBtnText}>Bagikan Gambar Kartu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 35, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '92%',
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  sheetTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.primary,
  },
  sheetSub: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-Bold',
  },
  scrollArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Kartu Pos (Didesain rapi untuk di-capture menjadi gambar)
  cardWrapper: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: colors.primary,
  },

  // Header Kartu
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  brandLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconImg: {
    width: 28,
    height: 28,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandAppName: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  brandAppTagline: {
    fontSize: 9,
    fontFamily: 'Montserrat-Medium',
    color: colors.textSecondary,
    lineHeight: 12,
  },

  tierChip: {
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tierChipText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.onTertiaryContainer,
  },

  // Konten Kutipan & Cerita
  quoteMark: {
    fontSize: 44,
    lineHeight: 44,
    fontFamily: 'Montserrat-Bold',
    color: colors.secondary,
    marginBottom: -8,
    marginTop: 8,
  },
  cardQuote: {
    ...typography.cardTitle,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardStoryText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.md,
  },

  // Langkah Nyata Box
  actionBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  actionLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  actionContent: {
    ...typography.bodySm,
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.textPrimary,
    lineHeight: 18,
  },

  // Footer Kartu yang Dirapikan
  cardFooterDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.sm + 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  footerAuthorCol: {
    flex: 1,
  },
  footerStoryLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat-Medium',
    color: colors.textMuted,
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerAuthorName: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.textPrimary,
  },
  footerWarmthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  footerWarmthText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.primary,
    fontStyle: 'italic',
  },

  // Link Kaki Kartu Gambar
  cardLinkRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3EBFE',
    alignItems: 'center',
  },
  cardLinkText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    color: colors.textMuted,
  },
  cardLinkHighlight: {
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
  },

  // Kotak Caption Pengantar di Bawah Kartu
  captionBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.md,
  },
  captionBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  captionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  captionBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  captionCopyBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  captionCopyBtnText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.primary,
  },
  captionPreviewText: {
    ...typography.bodySm,
    fontSize: 11,
    lineHeight: 18,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: 10,
    fontFamily: 'Montserrat-Regular',
  },
  captionHelperNote: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 14,
  },

  // Tombol aksi
  actionButtons: {
    marginTop: spacing.md,
  },
  primaryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryShareBtnText: {
    ...typography.labelSm,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
