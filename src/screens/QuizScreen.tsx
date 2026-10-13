import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, CheckIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { DASS21_ITEMS, ANSWER_SCALE, DASS21_TOTAL_ITEMS } from '../content/dass21';
import { CRISIS_COPY } from '../content/crisis';
import { useAppStore } from '../store/appStore';

interface Props {
  onBack: () => void;
  onComplete: () => void;
  onQuickClose: () => void;
}

export const QuizScreen: React.FC<Props> = ({ onBack, onComplete, onQuickClose }) => {
  const [index, setIndex] = useState(0);
  const [showCrisisGate, setShowCrisisGate] = useState(false);
  const [localAnswers, setLocalAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const answerQuestion = useAppStore((s) => s.answerQuestion);
  const submitQuiz = useAppStore((s) => s.submitQuiz);
  const openCrisisModal = useAppStore((s) => s.openCrisisModal);

  const item = DASS21_ITEMS[index];
  const isLast = index === DASS21_TOTAL_ITEMS - 1;
  const selected = localAnswers[item.id];
  const progress = ((index + 1) / DASS21_TOTAL_ITEMS) * 100;

  const handleSelect = (value: 0 | 1 | 2 | 3) => {
    setLocalAnswers({ ...localAnswers, [item.id]: value });
    answerQuestion(item.id, value);
  };

  const handleNext = async () => {
    if (selected === undefined) return;

    if (isLast) {
      setShowCrisisGate(true);
      return;
    }
    setIndex(index + 1);
  };

  const handleCrisisAnswer = async (isYes: boolean) => {
    if (isYes) {
      openCrisisModal('quiz_crisis_gate');
    }
    await submitQuiz(isYes);
    onComplete();
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => (index > 0 ? setIndex(index - 1) : onBack())}
          style={styles.iconBtn}
          accessibilityLabel="Kembali"
        >
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Skrining Awal</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        Pertanyaan {index + 1} dari {DASS21_TOTAL_ITEMS}
      </Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{item.text}</Text>
        <Text style={styles.questionHint}>Dalam 7 hari terakhir, seberapa sering kamu merasakan ini?</Text>

        <View style={styles.optionsList}>
          {ANSWER_SCALE.map((opt) => {
            const isSelected = selected === opt.value;
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
          style={[styles.nextBtn, selected === undefined && styles.nextBtnDisabled]}
          disabled={selected === undefined}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Lihat Hasil' : 'Lanjut'}</Text>
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
  progressLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.sm,
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
  optionTextSelected: { color: colors.onPrimary, fontWeight: '600' },
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
  crisisContent: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
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
