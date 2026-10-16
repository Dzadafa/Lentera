import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { MicrophoneIcon, SparkleIcon, CheckIcon, ShieldLockIcon, SpeakerIcon } from './Icons';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { voicePractice } from '../services/voicePractice';

interface Props {
  visible: boolean;
  targetScript: string;
  title?: string;
  contextDesc?: string;
  onClose: () => void;
}

export const SpeechPracticeModal: React.FC<Props> = ({
  visible,
  targetScript,
  title = 'Latihan Bicara Mandiri',
  contextDesc = 'Latih suaramu mengucapkan kalimat ini dengan tenang. Dengarkan artikulasimu sendiri sebagai persiapan sebelum berbicara langsung di loket faskes.',
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [timerCount, setTimerCount] = useState(0);

  const isNativeSupported = voicePractice.isSupported();
  const logWin = useAppStore((s) => s.logWin);

  // Animasi denyut mic saat aktif latihan
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Reset saat modal dibuka/tutup
  useEffect(() => {
    if (visible) {
      setTranscript('');
      setIsFinished(false);
      setIsListening(false);
      setIsPlayingExample(false);
      setTimerCount(0);
    } else {
      voicePractice.abort();
      void speech.stop();
    }
  }, [visible]);

  // Handle dengarkan contoh panduan suara (TTS)
  const handlePlayExample = async () => {
    void haptics.tap();
    setIsPlayingExample(true);
    await speech.speak(targetScript, { rate: 0.88, pitch: 1.0 });
    setTimeout(() => {
      setIsPlayingExample(false);
    }, 4000);
  };

  // Handle mulai latihan suara
  const handleStartPractice = async () => {
    void haptics.tap();
    setTranscript('');
    setIsFinished(false);
    setIsListening(true);

    if (isNativeSupported) {
      const granted = await voicePractice.requestPermissions();
      if (!granted) {
        setIsListening(false);
        Alert.alert(
          'Izin Mikrofon Diperlukan',
          'Mohon izinkan akses mikrofon di pengaturan perangkatmu untuk latihan bicara.'
        );
        return;
      }
      voicePractice.startListening({ lang: 'id-ID' });
    } else {
      // Mode simulasi latihan mandiri (misalnya saat di Expo Go)
      let count = 5;
      setTimerCount(count);
      const timer = setInterval(() => {
        count -= 1;
        setTimerCount(count);
        if (count <= 0) {
          clearInterval(timer);
          setIsListening(false);
          setTranscript(targetScript);
          setIsFinished(true);
          void haptics.success();
          void logWin('Menyelesaikan latihan bicara dengan suara');
        }
      }, 1000);
    }
  };

  const handleStopPractice = () => {
    void haptics.tap();
    if (isNativeSupported) {
      voicePractice.stopListening();
    }
    setIsListening(false);
    setIsFinished(true);
    void haptics.success();
    void logWin('Menyelesaikan latihan bicara dengan suara');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.contextSub}>{contextDesc}</Text>

          {/* Kartu Naskah Target */}
          <View style={styles.scriptCard}>
            <Text style={styles.scriptLabel}>NASKAH YANG PERLU KAMU UCAPKAN</Text>
            <Text style={styles.scriptBody}>"{targetScript}"</Text>

            <TouchableOpacity
              style={styles.exampleAudioBtn}
              onPress={handlePlayExample}
              activeOpacity={0.8}
            >
              <SpeakerIcon size={16} color={colors.primary} />
              <Text style={styles.exampleAudioBtnText}>
                {isPlayingExample ? 'Memutar contoh suara...' : 'Dengarkan Contoh Pelafalan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Jaminan Privasi On-Device */}
          <View style={styles.privacyChip}>
            <ShieldLockIcon size={14} color={colors.primary} />
            <Text style={styles.privacyChipText}>
              Latihan berlangsung luring di perangkatmu tanpa transmisi ke server mana pun.
            </Text>
          </View>

          {/* Area Transkripsi / Status Latihan */}
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>PROSES LATIHAN UCAPAN:</Text>
            {isListening ? (
              <View style={styles.listeningBox}>
                <Text style={styles.listeningText}>
                  {timerCount > 0
                    ? `Silakan ucapkan naskah di atas dengan tenang... (${timerCount}d)`
                    : 'Sedang menyimak suaramu... bicara perlahan dan jelas.'}
                </Text>
              </View>
            ) : transcript ? (
              <Text style={styles.transcriptText}>{transcript}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                Tekan tombol mikrofon di bawah dan ucapkan kalimat di atas.
              </Text>
            )}
          </View>

          {/* Umpan Balik Selesai Latihan */}
          {isFinished && (
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <SparkleIcon size={18} color={colors.primary} />
                <Text style={styles.feedbackTitle}>Latihan Berhasil Selesai!</Text>
              </View>

              <Text style={styles.feedbackBody}>
                Luar biasa! Kamu sudah melatih artikulasi suaramu secara tenang dan berani. Mengucapkan ini berulang kali di depan cermin atau saat sendirian akan membuat lidahmu terbiasa.
              </Text>

              <View style={styles.winBadge}>
                <CheckIcon size={14} color={colors.primary} />
                <Text style={styles.winBadgeText}>Kemenangan kecil tercatat di profilmu</Text>
              </View>
            </View>
          )}

          {/* Tombol Mikrofon Interaktif */}
          <View style={styles.micSection}>
            <Animated.View
              style={[
                styles.micCircleWrap,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.micBtn, isListening && styles.micBtnListening]}
                onPress={isListening ? handleStopPractice : handleStartPractice}
                activeOpacity={0.8}
              >
                <MicrophoneIcon size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.micInstruction}>
              {isListening
                ? 'Sedang menyimak... ketuk bila sudah selesai'
                : isFinished
                ? 'Ketuk untuk mengulang latihan lagi'
                : 'Ketuk tombol mikrofon untuk mulai berlatih'}
            </Text>
          </View>

          {isFinished && (
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.88}>
              <Text style={styles.doneBtnText}>Selesai & Tutup Latihan</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  topTitle: {
    ...typography.labelLg,
    fontFamily: 'Montserrat-Bold',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.xxl + 40,
  },
  contextSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  scriptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  scriptLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  scriptBody: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  exampleAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  exampleAudioBtnText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.primary,
  },
  privacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  privacyChipText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.primary,
    flex: 1,
  },
  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    minHeight: 90,
    marginBottom: spacing.md,
  },
  resultLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  listeningBox: {
    paddingVertical: 8,
  },
  listeningText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  transcriptText: {
    ...typography.bodySm,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 22,
  },
  placeholderText: {
    ...typography.bodySm,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  feedbackCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  feedbackTitle: {
    ...typography.labelLg,
    color: colors.onPrimaryContainer,
  },
  feedbackBody: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  winBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  winBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.primary,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  micCircleWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  micBtnListening: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  micInstruction: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  doneBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.3,
  },
});
