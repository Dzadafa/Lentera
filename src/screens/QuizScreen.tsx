import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, CheckIcon, SparkleIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import {
  K10_ITEMS,
  K10_SCALE,
  PHQ9_ITEMS,
  PHQ9_SCALE,
  GAD7_ITEMS,
  GAD7_SCALE,
} from '../content/screeningInstruments';
import { CRISIS_COPY } from '../content/crisis';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';

interface Props {
  onBack: () => void;
  onComplete: () => void;
  onQuickClose: () => void;
}

type ScreeningStage = 'k10' | 'transition' | 'phq9' | 'gad7';

export const QuizScreen: React.FC<Props> = ({ onBack, onComplete, onQuickClose }) => {
  const [stage, setStage] = useState<ScreeningStage>('k10');
  const [k10Index, setK10Index] = useState(0);
  const [phq9Index, setPhq9Index] = useState(0);
  const [gad7Index, setGad7Index] = useState(0);

  const [k10Answers, setK10Answers] = useState<Record<string, number>>({});
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({});
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({});

  const [showCrisisGate, setShowCrisisGate] = useState(false);

  const submitTieredQuiz = useAppStore((s) => s.submitTieredQuiz);
  const openCrisisModal = useAppStore((s) => s.openCrisisModal);

  // K10 Total calculation
  const currentK10Score = useMemo(() => {
    return Object.values(k10Answers).reduce((sum, val) => sum + val, 0);
  }, [k10Answers]);

  // Current question and scale resolution based on stage
  const currentItem = useMemo(() => {
    if (stage === 'k10') return K10_ITEMS[k10Index];
    if (stage === 'phq9') return PHQ9_ITEMS[phq9Index];
    if (stage === 'gad7') return GAD7_ITEMS[gad7Index];
    return null;
  }, [stage, k10Index, phq9Index, gad7Index]);

  const currentScale = useMemo(() => {
    if (stage === 'k10') return K10_SCALE;
    if (stage === 'phq9') return PHQ9_SCALE;
    if (stage === 'gad7') return GAD7_SCALE;
    return [];
  }, [stage]);

  const selectedValue = useMemo(() => {
    if (!currentItem) return undefined;
    if (stage === 'k10') return k10Answers[currentItem.id];
    if (stage === 'phq9') return phq9Answers[currentItem.id];
    if (stage === 'gad7') return gad7Answers[currentItem.id];
    return undefined;
  }, [stage, currentItem, k10Answers, phq9Answers, gad7Answers]);

  const handleSelect = (val: number) => {
    if (!currentItem) return;
    void haptics.tap();
    if (stage === 'k10') {
      setK10Answers({ ...k10Answers, [currentItem.id]: val });
    } else if (stage === 'phq9') {
      setPhq9Answers({ ...phq9Answers, [currentItem.id]: val });
    } else if (stage === 'gad7') {
      setGad7Answers({ ...gad7Answers, [currentItem.id]: val });
    }
  };

  const handleNext = async () => {
    if (selectedValue === undefined) return;

    if (stage === 'k10') {
      if (k10Index < K10_ITEMS.length - 1) {
        setK10Index(k10Index + 1);
      } else {
        // Selesai K-10 10 butir: cek skor
        const total = Object.values({ ...k10Answers, [currentItem!.id]: selectedValue }).reduce(
          (sum, v) => sum + v,
          0
        );
        if (total >= 25) {
          // Terindikasi distres tinggi (skor >= 25) -> Buka tahap PHQ-9 & GAD-7
          setStage('transition');
        } else {
          // Distres normal/rendah/sedang di bawah 25 -> Langsung selesai atau cek gerbang krisis
          setShowCrisisGate(true);
        }
      }
    } else if (stage === 'phq9') {
      if (phq9Index < PHQ9_ITEMS.length - 1) {
        setPhq9Index(phq9Index + 1);
      } else {
        // Lanjut ke GAD-7
        setStage('gad7');
      }
    } else if (stage === 'gad7') {
      if (gad7Index < GAD7_ITEMS.length - 1) {
        setGad7Index(gad7Index + 1);
      } else {
        // Selesai semua
        setShowCrisisGate(true);
      }
    }
  };

  const handleBack = () => {
    if (stage === 'k10') {
      if (k10Index > 0) setK10Index(k10Index - 1);
      else onBack();
    } else if (stage === 'transition') {
      setStage('k10');
      setK10Index(K10_ITEMS.length - 1);
    } else if (stage === 'phq9') {
      if (phq9Index > 0) setPhq9Index(phq9Index - 1);
      else setStage('transition');
    } else if (stage === 'gad7') {
      if (gad7Index > 0) setGad7Index(gad7Index - 1);
      else {
        setStage('phq9');
        setPhq9Index(PHQ9_ITEMS.length - 1);
      }
    }
  };

  const handleCrisisAnswer = async (isYes: boolean) => {
    if (isYes) {
      openCrisisModal('quiz_crisis_gate');
    }
    await submitTieredQuiz(k10Answers, phq9Answers, gad7Answers, isYes);
    onComplete();
  };

  // Gerbang Konfirmasi Krisis (Satu Pertanyaan Terakhir)
  if (showCrisisGate) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={{ width: 40 }} />
          <Text style={styles.topTitle}>Satu pertanyaan terakhir</Text>
          <QuickCloseButton onPress={onQuickClose} label="" />
        </View>

        <ScrollView contentContainerStyle={styles.crisisContent}>
          <View style={styles.crisisCard}>
            <Text style={styles.crisisQuestion}>{CRISIS_COPY.gateQuestion}</Text>
            <Text style={styles.crisisHelper}>{CRISIS_COPY.gateHelper}</Text>
          </View>

          <TouchableOpacity
            style={styles.crisisYesBtn}
            onPress={() => handleCrisisAnswer(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.crisisYesLabel}>Ya, saya pernah memikirkannya</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.crisisNoBtn}
            onPress={() => handleCrisisAnswer(false)}
            activeOpacity={0.88}
          >
            <Text style={styles.crisisNoLabel}>Tidak, saya tidak pernah</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Layar Transisi Edukatif ketika Skor K-10 >= 25
  if (stage === 'transition') {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn} accessibilityLabel="Kembali">
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Skrining Bertingkat</Text>
          <QuickCloseButton onPress={onQuickClose} label="" />
        </View>

        <ScrollView contentContainerStyle={styles.transitionContent}>
          <View style={styles.alertIconBadge}>
            <SparkleIcon size={32} color={colors.primary} />
          </View>

          <Text style={styles.transitionTitle}>Skor K-10: {currentK10Score} (Indikasi Distres Tinggi)</Text>

          <Text style={styles.transitionDesc}>
            Hasil 10 butir cepat K-10 kamu menunjukkan skor ≥ 25, menandakan tingkat distres yang sedang membebani dirimu saat ini.
          </Text>

          <View style={styles.transitionCard}>
            <Text style={styles.transitionCardHeader}>Membuka Skrining Spesifik:</Text>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>PHQ-9 (9 Pertanyaan):</Text> Memetakan lebih dalam tingkat keparahan gejala depresi & suasana hati.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>GAD-7 (7 Pertanyaan):</Text> Memetakan tingkat kecemasan menyeluruh agar rujukan faskes lebih presisi.
              </Text>
            </View>
          </View>

          <Text style={styles.transitionHint}>
            Ini akan membantu dokter faskes BPJS atau psikolog memahami kondisimu secara lebih lengkap.
          </Text>

          <TouchableOpacity
            style={styles.transitionCta}
            onPress={() => setStage('phq9')}
            activeOpacity={0.88}
          >
            <Text style={styles.transitionCtaText}>Lanjutkan ke PHQ-9 & GAD-7</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Header teks & progres per instrumen
  let stageTitle = 'K-10: Distres Cepat';
  let questionNumberText = `Pertanyaan ${k10Index + 1} dari 10`;
  let stageHint = 'Dalam 30 hari terakhir, seberapa sering kamu merasakan ini?';
  let progressPercent = ((k10Index + 1) / 10) * 100;

  if (stage === 'phq9') {
    stageTitle = 'PHQ-9: Skrining Depresi';
    questionNumberText = `Pertanyaan ${phq9Index + 1} dari 9`;
    stageHint = 'Dalam 2 minggu terakhir, seberapa sering kamu terganggu oleh hal ini?';
    progressPercent = ((phq9Index + 1) / 9) * 100;
  } else if (stage === 'gad7') {
    stageTitle = 'GAD-7: Skrining Kecemasan';
    questionNumberText = `Pertanyaan ${gad7Index + 1} dari 7`;
    stageHint = 'Dalam 2 minggu terakhir, seberapa sering kamu terganggu oleh masalah ini?';
    progressPercent = ((gad7Index + 1) / 7) * 100;
  }

  const isCurrentLast =
    (stage === 'k10' && k10Index === 9) ||
    (stage === 'phq9' && phq9Index === 8) ||
    (stage === 'gad7' && gad7Index === 6);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{stageTitle}</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.progressLabel}>{questionNumberText}</Text>
        {stage !== 'k10' && (
          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>Tahap Lanjutan</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{currentItem?.text}</Text>
        <Text style={styles.questionHint}>{stageHint}</Text>

        <View style={styles.optionsList}>
          {currentScale.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.85}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <View style={styles.optionCheck}>
                    <CheckIcon size={14} color={colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, selectedValue === undefined && styles.nextBtnDisabled]}
          disabled={selectedValue === undefined}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {stage === 'k10' && isCurrentLast
              ? 'Lanjut Evaluasi K-10'
              : stage === 'phq9' && isCurrentLast
              ? 'Lanjut ke GAD-7'
              : stage === 'gad7' && isCurrentLast
              ? 'Tampilkan Hasil'
              : 'Lanjut'}
          </Text>
        </TouchableOpacity>
      </View>
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
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: colors.tertiary, borderRadius: 3 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  stagePill: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  stagePillText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  content: { paddingHorizontal: spacing.marginMobile, paddingBottom: 120 },
  questionText: { ...typography.headlineLg, color: colors.onBackground, marginTop: spacing.md },
  questionHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  optionsList: { gap: spacing.sm + 2 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.bodyLg, color: colors.onSurface },
  optionTextSelected: { color: colors.onPrimary, fontFamily: 'Montserrat-SemiBold' },
  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: 28,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: { ...typography.labelLg, color: '#FFFFFF' },
  transitionContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  alertIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  transitionTitle: {
    ...typography.headlineLg,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  transitionDesc: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  transitionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    width: '100%',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  transitionCardHeader: {
    ...typography.labelMd,
    color: colors.primary,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
    marginTop: 7,
  },
  bulletText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 20,
  },
  boldText: {
    fontFamily: 'Montserrat-SemiBold',
    color: colors.onSurface,
  },
  transitionHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  transitionCta: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  transitionCtaText: {
    ...typography.labelLg,
    color: '#FFFFFF',
  },
  crisisContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  crisisCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.crisis,
    marginBottom: spacing.lg,
  },
  crisisQuestion: { ...typography.headlineMd, color: colors.onSurface },
  crisisHelper: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: spacing.sm },
  crisisYesBtn: {
    backgroundColor: colors.crisis,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  crisisYesLabel: { ...typography.labelLg, color: '#FFFFFF' },
  crisisNoBtn: {
    backgroundColor: colors.surface,
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  crisisNoLabel: { ...typography.labelLg, color: colors.onSurface },
});
